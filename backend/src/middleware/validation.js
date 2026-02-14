import { z } from 'zod';

// ── Schemas ────────────────────────────────────────────────────────

/** Schema for creating / updating a single transaction */
const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'investment']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  categoryId: z.number().int().positive().optional(),
});

/** Schema for creating a recurring transaction (adds frequency) */
const recurringTransactionSchema = transactionSchema.extend({
  frequency: z.enum(['weekly', 'monthly', 'annual']),
});

/** Schema for creating / updating a category */
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['expense', 'income', 'investment']),
});

/** Schema for updating future recurring occurrences */
const updateRecurringSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
});

// ── Middleware factory ─────────────────────────────────────────────

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (coerced / stripped) value.
 * On failure, forwards the ZodError to the error-handler middleware.
 *
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {import('express').RequestHandler} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ── Exported middleware ────────────────────────────────────────────

export const validateTransaction = validate(transactionSchema);
export const validateRecurringTransaction = validate(recurringTransactionSchema);
export const validateCategory = validate(categorySchema);
export const validateUpdateRecurring = validate(updateRecurringSchema);
