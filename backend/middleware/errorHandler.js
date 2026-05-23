// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    // Log the error centrally
    console.error('[Global Error]', err.message || err);

    // If the error has a statusCode (like our business logic errors from Service layer), use it.
    // Otherwise, default to 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Internal server error';

    res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
