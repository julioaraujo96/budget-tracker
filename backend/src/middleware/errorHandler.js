import { AppError } from '../errors.js';

/**
 * Global error handler middleware for Express.
 *
 * Handles:
 * - Zod validation errors (400)
 * - JSON parse errors (400)
 * - Operational / custom AppError subclasses (dynamic status)
 * - Unexpected errors (500)
 *
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // Log errors outside of test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues,
    });
  }

  // JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
    });
  }

  // Operational errors (AppError, NotFoundError, ValidationError)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unexpected / programmer errors
  res.status(500).json({
    error: 'Internal server error',
  });
};
