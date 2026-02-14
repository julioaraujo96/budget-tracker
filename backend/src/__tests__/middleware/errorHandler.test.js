import { jest } from '@jest/globals';
import { errorHandler } from '../../middleware/errorHandler.js';
import { AppError, NotFoundError, ValidationError } from '../../errors.js';

/**
 * Helper that creates mock Express req/res/next and runs the error handler.
 * Returns the response status code and JSON body.
 */
function runErrorHandler(err) {
  let statusCode;
  let jsonBody;

  const req = {};
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonBody = body;
      return this;
    },
  };
  const next = jest.fn();

  errorHandler(err, req, res, next);

  return { statusCode, jsonBody };
}

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // ─── Zod validation errors ─────────────────────────────────────

  describe('Zod validation errors', () => {
    it('should return 400 with validation details', () => {
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [
        { path: ['amount'], message: 'Expected number, received string' },
      ];

      const { statusCode, jsonBody } = runErrorHandler(zodError);

      expect(statusCode).toBe(400);
      expect(jsonBody).toEqual({
        error: 'Validation failed',
        details: zodError.issues,
      });
    });

    it('should include all issue details in the response', () => {
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [
        { path: ['type'], message: 'Invalid enum value' },
        { path: ['amount'], message: 'Required' },
      ];

      const { jsonBody } = runErrorHandler(zodError);

      expect(jsonBody.details).toHaveLength(2);
    });
  });

  // ─── JSON parse errors ─────────────────────────────────────────

  describe('JSON parse errors', () => {
    it('should return 400 with "Invalid JSON" message', () => {
      const syntaxError = new SyntaxError('Unexpected token');
      syntaxError.status = 400;

      const { statusCode, jsonBody } = runErrorHandler(syntaxError);

      expect(statusCode).toBe(400);
      expect(jsonBody).toEqual({
        error: 'Invalid JSON in request body',
      });
    });

    it('should not catch SyntaxError without status 400', () => {
      const syntaxError = new SyntaxError('Some other syntax error');
      // No .status property

      const { statusCode, jsonBody } = runErrorHandler(syntaxError);

      expect(statusCode).toBe(500);
      expect(jsonBody).toEqual({ error: 'Internal server error' });
    });
  });

  // ─── Operational errors (AppError subclasses) ──────────────────

  describe('operational errors', () => {
    it('should handle NotFoundError with 404', () => {
      const error = new NotFoundError('Transaction');

      const { statusCode, jsonBody } = runErrorHandler(error);

      expect(statusCode).toBe(404);
      expect(jsonBody).toEqual({ error: 'Transaction not found' });
    });

    it('should handle ValidationError with 400', () => {
      const error = new ValidationError(
        'Cannot delete category with associated transactions',
      );

      const { statusCode, jsonBody } = runErrorHandler(error);

      expect(statusCode).toBe(400);
      expect(jsonBody).toEqual({
        error: 'Cannot delete category with associated transactions',
      });
    });

    it('should handle AppError with custom status code', () => {
      const error = new AppError('Custom error', 422);

      const { statusCode, jsonBody } = runErrorHandler(error);

      expect(statusCode).toBe(422);
      expect(jsonBody).toEqual({ error: 'Custom error' });
    });

    it('should handle default AppError with 500', () => {
      const error = new AppError('Something broke');

      const { statusCode, jsonBody } = runErrorHandler(error);

      expect(statusCode).toBe(500);
      expect(jsonBody).toEqual({ error: 'Something broke' });
    });
  });

  // ─── Unexpected errors ─────────────────────────────────────────

  describe('unexpected errors', () => {
    it('should return 500 with generic message for unknown errors', () => {
      const error = new Error('Something completely unexpected');

      const { statusCode, jsonBody } = runErrorHandler(error);

      expect(statusCode).toBe(500);
      expect(jsonBody).toEqual({ error: 'Internal server error' });
    });

    it('should return 500 for TypeError', () => {
      const error = new TypeError('Cannot read properties of undefined');

      const { statusCode, jsonBody } = runErrorHandler(error);

      expect(statusCode).toBe(500);
      expect(jsonBody).toEqual({ error: 'Internal server error' });
    });
  });

  // ─── Logging behavior ─────────────────────────────────────────

  describe('logging', () => {
    it('should not log errors in test environment', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      process.env.NODE_ENV = 'test';

      runErrorHandler(new Error('test error'));

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should log errors in non-test environments', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';

      runErrorHandler(new Error('dev error'));

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
