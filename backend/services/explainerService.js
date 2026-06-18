// backend/services/explainerService.js
//
// Plain-language insurance assistant, powered by the Claude API.
// Translates a system decision (403 "Eligibility failed", REJECTED, over-limit, etc.)
// into a clear, empathetic explanation + concrete next steps for a non-expert.
//
// Runs SERVER-SIDE only — the API key lives in backend/.env and never reaches the browser.

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-opus-4-8';

// Construct the client lazily so a missing key can't crash server startup.
let client;
function getClient() {
    if (!process.env.ANTHROPIC_API_KEY) {
        const error = new Error('AI assistant is not configured (missing ANTHROPIC_API_KEY).');
        error.statusCode = 503;
        throw error;
    }
    if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
    return client;
}

// The model must return exactly this shape.
const OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
        explanation: { type: 'string' },
        nextSteps: { type: 'array', items: { type: 'string' } }
    },
    required: ['explanation', 'nextSteps'],
    additionalProperties: false
};

const SYSTEM_PROMPT = `You are a friendly benefits assistant for a corporate health-insurance system.
Your audience is an everyday employee who is NOT an insurance or software expert.

Rules:
- Write at a 9th-grade reading level. Short sentences. No jargon.
- NEVER use raw system terms: status codes (403, 404, 409), enum values
  (PENDING, APPROVED, REJECTED), or words like "eligibility criteria", "null", "API".
- Be warm and non-judgmental. A rejection is not the person's fault.
- Only use facts in the information given. Do NOT invent dollar amounts, dates,
  plan names, or rules. If a number is not provided, do not state one.
- Give concrete, actionable next steps.
- Keep the explanation under about 100 words.`;

const explainerService = {
    /**
     * Turn a system situation into a plain-language explanation.
     * @param {Object} input
     * @param {string} input.situation - What happened, in system terms.
     * @param {string} [input.details] - Optional extra context (plan type, amounts, etc.).
     * @returns {Promise<{explanation: string, nextSteps: string[]}>}
     */
    async explain({ situation, details }) {
        const userContent = [
            'Explain the following insurance situation to the employee.',
            '',
            `SITUATION: ${situation}`,
            details ? `DETAILS: ${details}` : ''
        ].join('\n').trim();

        let response;
        try {
            response = await getClient().messages.create({
                model: MODEL,
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
                messages: [{ role: 'user', content: userContent }]
            });
        } catch (err) {
            if (err instanceof Anthropic.AuthenticationError) {
                err.statusCode = 503;
                err.message = 'AI assistant is misconfigured (bad API key).';
            } else if (err instanceof Anthropic.RateLimitError) {
                err.statusCode = 429;
                err.message = 'The AI assistant is busy. Please try again shortly.';
            } else if (err instanceof Anthropic.BadRequestError) {
                // 400 = the API rejected the request itself (most commonly: the
                // account's credit balance is empty). This is a server-side
                // config/billing issue, not a network outage. Log the real
                // reason for developers; show the user a clean, generic message.
                console.error('[Explainer] API rejected request:', err.message);
                err.statusCode = 503;
                err.message = 'The AI assistant is temporarily unavailable. Please try again later.';
            } else {
                err.statusCode = 502;
                err.message = 'The AI assistant could not be reached.';
            }
            throw err;
        }

        if (response.stop_reason === 'refusal') {
            const error = new Error('The AI assistant declined to answer this request.');
            error.statusCode = 422;
            throw error;
        }

        const textBlock = response.content.find((b) => b.type === 'text');
        if (!textBlock) {
            const error = new Error('The AI assistant returned an empty response.');
            error.statusCode = 502;
            throw error;
        }

        return JSON.parse(textBlock.text);
    }
};

module.exports = explainerService;
