// backend/evals/explainer.eval.js
//
// Evaluation harness for the plain-language explainer.
// An LLM's output is not guaranteed correct, so before trusting it in front of
// employees we check each response against rules we care about, and have a
// second model judge its clarity. Run from the backend folder:
//     node evals/explainer.eval.js
//
// Layer 1 — deterministic rules (cheap, exact): the hard gate.
// Layer 2 — LLM-as-judge (clarity/empathy, 1-5): a signal, NOT ground truth
//           (the judge is itself an LLM and can be wrong).

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const explainerService = require('../services/explainerService');

const client = new Anthropic();
const JUDGE_MODEL = 'claude-opus-4-8';

// Realistic situations from this system.
const TEST_CASES = [
    {
        name: 'Under-18 enrollment rejection',
        input: {
            situation: 'Enrollment rejected: User must be 18 or older to enroll.',
            details: 'The employee is 15 years old.'
        }
    },
    {
        name: 'Over-limit claim',
        input: {
            situation: 'Claim rejected: limit exceeded for your plan.',
            details: 'Plan: Basic Health, annual limit $1000. Already used $900. This claim is $300.'
        }
    },
    {
        name: 'Unknown user',
        input: {
            situation: 'Enrollment failed: user not found in company records.',
            details: 'The email address is not on the company employee list.'
        }
    },
    {
        name: 'Duplicate enrollment',
        input: {
            situation: 'Enrollment failed: user already has an enrollment record.',
            details: 'This employee already enrolled in a plan earlier.'
        }
    }
];

// ---- Layer 1: deterministic checks ----

const FORBIDDEN_CI = ['eligibility', 'status code', 'http', 'enum', 'null', '403', '404', '409'];
const FORBIDDEN_ENUM = ['PENDING', 'APPROVED', 'REJECTED']; // case-sensitive raw enum

function checkNoJargon(out) {
    const text = `${out.explanation} ${out.nextSteps.join(' ')}`;
    const lower = text.toLowerCase();
    const hitCI = FORBIDDEN_CI.find((w) => lower.includes(w));
    if (hitCI) return { pass: false, detail: `contains jargon: "${hitCI}"` };
    const hitEnum = FORBIDDEN_ENUM.find((w) => text.includes(w));
    if (hitEnum) return { pass: false, detail: `contains raw enum: "${hitEnum}"` };
    return { pass: true };
}

function checkHasNextSteps(out) {
    const ok = Array.isArray(out.nextSteps) && out.nextSteps.length >= 1;
    return { pass: ok, detail: ok ? '' : 'no next steps returned' };
}

function dollarAmounts(text) {
    const matches = text.match(/\$\s?[\d,]+(?:\.\d+)?/g) || [];
    return matches.map((m) => m.replace(/[$,\s]/g, ''));
}
function checkGroundedNumbers(input, out) {
    const inputAmounts = new Set(dollarAmounts(`${input.situation} ${input.details || ''}`));
    const outAmounts = dollarAmounts(`${out.explanation} ${out.nextSteps.join(' ')}`);
    const invented = outAmounts.filter((a) => !inputAmounts.has(a));
    if (invented.length) return { pass: false, detail: `invented amount(s): $${invented.join(', $')}` };
    return { pass: true };
}

function checkLength(out) {
    const words = out.explanation.trim().split(/\s+/).length;
    const ok = words <= 120;
    return { pass: ok, detail: ok ? '' : `explanation too long (${words} words)` };
}

// ---- Layer 2: LLM-as-judge ----

const JUDGE_SCHEMA = {
    type: 'object',
    properties: {
        score: { type: 'integer' },   // 1-5
        reasoning: { type: 'string' }
    },
    required: ['score', 'reasoning'],
    additionalProperties: false
};

async function judgeClarity(input, out) {
    const prompt = `You are grading a benefits assistant's reply to an employee.

The employee's situation was:
${input.situation}${input.details ? '\n' + input.details : ''}

The assistant replied:
EXPLANATION: ${out.explanation}
NEXT STEPS: ${out.nextSteps.join(' | ')}

Score the reply from 1 to 5 on whether a non-expert would find it clear, kind,
and actually helpful (5 = excellent, 1 = poor). Give one sentence of reasoning.`;

    const res = await client.messages.create({
        model: JUDGE_MODEL,
        max_tokens: 512,
        output_config: { format: { type: 'json_schema', schema: JUDGE_SCHEMA } },
        messages: [{ role: 'user', content: prompt }]
    });
    const text = res.content.find((b) => b.type === 'text').text;
    return JSON.parse(text);
}

// ---- Runner ----

const JUDGE_PASS = 4;

async function run() {
    let hardChecksTotal = 0;
    let hardChecksPassed = 0;
    let casesFailed = 0;

    for (const tc of TEST_CASES) {
        console.log(`\n=== ${tc.name} ===`);
        let out;
        try {
            out = await explainerService.explain(tc.input);
        } catch (err) {
            console.log(`  ERROR calling explainer: ${err.statusCode || ''} ${err.message}`);
            casesFailed++;
            continue;
        }

        const checks = {
            'no jargon': checkNoJargon(out),
            'has next steps': checkHasNextSteps(out),
            'grounded numbers': checkGroundedNumbers(tc.input, out),
            'length ok': checkLength(out)
        };

        let caseOk = true;
        for (const [name, result] of Object.entries(checks)) {
            hardChecksTotal++;
            if (result.pass) hardChecksPassed++;
            else caseOk = false;
            console.log(`  [${result.pass ? 'PASS' : 'FAIL'}] ${name}${result.detail ? ' — ' + result.detail : ''}`);
        }

        const judge = await judgeClarity(tc.input, out);
        const judgeOk = judge.score >= JUDGE_PASS;
        if (!judgeOk) caseOk = false;
        console.log(`  [${judgeOk ? 'PASS' : 'FAIL'}] clarity judge — score ${judge.score}/5: ${judge.reasoning}`);

        if (!caseOk) casesFailed++;
    }

    console.log('\n========================================');
    console.log(`Hard checks: ${hardChecksPassed}/${hardChecksTotal} passed`);
    console.log(`Cases fully passed: ${TEST_CASES.length - casesFailed}/${TEST_CASES.length}`);
    console.log('========================================');

    if (casesFailed > 0) {
        console.log('RESULT: FAIL');
        process.exit(1);
    }
    console.log('RESULT: PASS');
    process.exit(0);
}

run();
