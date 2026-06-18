const explainerService = require('../services/explainerService');

const explainerController = {
    // Handle a request to explain a system situation in plain language
    async explain(req, res, next) {
        const { situation, details } = req.body;

        // Input validation (Controller's job)
        if (!situation) {
            return res.status(400).json({ error: 'situation is required' });
        }

        try {
            const result = await explainerService.explain({ situation, details });
            res.status(200).json(result);
        } catch (error) {
            // Hand off to the global error handler (sets status from error.statusCode)
            next(error);
        }
    }
};

module.exports = explainerController;
