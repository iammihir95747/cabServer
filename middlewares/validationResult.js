const { validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// middlewares/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.stack); // Log the full error stack

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Use existing status code if set, otherwise 500
  res.status(statusCode);

  res.json({
    message: err.message,
    // Only include stack trace in development mode for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};