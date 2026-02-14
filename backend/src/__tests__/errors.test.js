import { AppError, NotFoundError, ValidationError } from '../errors.js';

describe('Custom error classes', () => {
  // ─── AppError ──────────────────────────────────────────────────

  describe('AppError', () => {
    it('should set message, default statusCode 500, and isOperational true', () => {
      const error = new AppError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should accept a custom status code', () => {
      const error = new AppError('Forbidden', 403);

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should be an instance of Error', () => {
      const error = new AppError('test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have a stack trace', () => {
      const error = new AppError('test');

      expect(error.stack).toBeDefined();
    });
  });

  // ─── NotFoundError ─────────────────────────────────────────────

  describe('NotFoundError', () => {
    it('should set a default message with "Resource not found"', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should include the resource name in the message', () => {
      const error = new NotFoundError('Transaction');

      expect(error.message).toBe('Transaction not found');
    });

    it('should be an instance of AppError and Error', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should be operational', () => {
      const error = new NotFoundError();

      expect(error.isOperational).toBe(true);
    });
  });

  // ─── ValidationError ──────────────────────────────────────────

  describe('ValidationError', () => {
    it('should set message and statusCode 400', () => {
      const error = new ValidationError('Amount must be positive');

      expect(error.message).toBe('Amount must be positive');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should be an instance of AppError and Error', () => {
      const error = new ValidationError('test');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should be operational', () => {
      const error = new ValidationError('test');

      expect(error.isOperational).toBe(true);
    });
  });

  // ─── Error hierarchy ──────────────────────────────────────────

  describe('error hierarchy', () => {
    it('should distinguish between error types using instanceof', () => {
      const appErr = new AppError('app');
      const notFoundErr = new NotFoundError('item');
      const validationErr = new ValidationError('invalid');

      // NotFoundError and ValidationError are AppErrors
      expect(notFoundErr).toBeInstanceOf(AppError);
      expect(validationErr).toBeInstanceOf(AppError);

      // But AppError is not a NotFoundError or ValidationError
      expect(appErr).not.toBeInstanceOf(NotFoundError);
      expect(appErr).not.toBeInstanceOf(ValidationError);

      // NotFoundError is not a ValidationError and vice versa
      expect(notFoundErr).not.toBeInstanceOf(ValidationError);
      expect(validationErr).not.toBeInstanceOf(NotFoundError);
    });
  });
});
