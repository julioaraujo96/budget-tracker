/**
 * Base application error class.
 * All operational errors should extend this class.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} [statusCode=500] - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Error thrown when a requested resource does not exist.
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} [resource='Resource'] - Name of the missing resource
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when input data fails business-rule validation.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Description of what validation failed
   */
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}
