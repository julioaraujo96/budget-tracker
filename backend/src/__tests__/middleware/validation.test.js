import {
  validateTransaction,
  validateRecurringTransaction,
  validateCategory,
  validateUpdateRecurring,
} from '../../middleware/validation.js';

/**
 * Helper that runs an Express middleware and captures the result.
 * Returns { req, res, nextArg } where nextArg is the argument passed to next().
 */
function runMiddleware(middleware, body) {
  return new Promise((resolve) => {
    const req = { body };
    const res = {}; // Not used by validation middleware
    const next = (arg) => resolve({ req, res, nextArg: arg });
    middleware(req, res, next);
  });
}

describe('validation middleware', () => {
  // ─── validateTransaction ──────────────────────────────────────

  describe('validateTransaction', () => {
    const validBody = {
      type: 'expense',
      amount: 42.5,
      description: 'Coffee',
      date: '2026-02-14',
      categoryId: 1,
    };

    it('should pass with a valid transaction body', async () => {
      const { req, nextArg } = await runMiddleware(validateTransaction, {
        ...validBody,
      });

      expect(nextArg).toBeUndefined(); // next() called with no error
      expect(req.body).toMatchObject(validBody);
    });

    it('should pass when optional fields are omitted', async () => {
      const { nextArg } = await runMiddleware(validateTransaction, {
        type: 'income',
        amount: 5000,
        date: '2026-01-01',
      });

      expect(nextArg).toBeUndefined();
    });

    it('should forward a ZodError when type is invalid', async () => {
      const { nextArg } = await runMiddleware(validateTransaction, {
        ...validBody,
        type: 'invalid',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when amount is negative', async () => {
      const { nextArg } = await runMiddleware(validateTransaction, {
        ...validBody,
        amount: -10,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when amount is zero', async () => {
      const { nextArg } = await runMiddleware(validateTransaction, {
        ...validBody,
        amount: 0,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when amount is missing', async () => {
      const { type, date } = validBody;
      const { nextArg } = await runMiddleware(validateTransaction, {
        type,
        date,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when date has wrong format', async () => {
      const { nextArg } = await runMiddleware(validateTransaction, {
        ...validBody,
        date: '14/02/2026',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when date is missing', async () => {
      const { nextArg } = await runMiddleware(validateTransaction, {
        type: 'expense',
        amount: 42.5,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should strip extra fields from the body', async () => {
      const { req, nextArg } = await runMiddleware(validateTransaction, {
        ...validBody,
        extraField: 'should be removed',
      });

      expect(nextArg).toBeUndefined();
      expect(req.body).not.toHaveProperty('extraField');
    });

    it('should accept all valid transaction types', async () => {
      for (const type of ['expense', 'income', 'investment']) {
        const { nextArg } = await runMiddleware(validateTransaction, {
          ...validBody,
          type,
        });
        expect(nextArg).toBeUndefined();
      }
    });
  });

  // ─── validateRecurringTransaction ─────────────────────────────

  describe('validateRecurringTransaction', () => {
    const validBody = {
      type: 'expense',
      amount: 9.99,
      date: '2026-02-01',
      frequency: 'monthly',
    };

    it('should pass with a valid recurring transaction body', async () => {
      const { nextArg } = await runMiddleware(validateRecurringTransaction, {
        ...validBody,
      });

      expect(nextArg).toBeUndefined();
    });

    it('should accept all valid frequencies', async () => {
      for (const frequency of ['weekly', 'monthly', 'annual']) {
        const { nextArg } = await runMiddleware(validateRecurringTransaction, {
          ...validBody,
          frequency,
        });
        expect(nextArg).toBeUndefined();
      }
    });

    it('should forward a ZodError when frequency is missing', async () => {
      const { nextArg } = await runMiddleware(validateRecurringTransaction, {
        type: 'expense',
        amount: 9.99,
        date: '2026-02-01',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when frequency is invalid', async () => {
      const { nextArg } = await runMiddleware(validateRecurringTransaction, {
        ...validBody,
        frequency: 'daily',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });
  });

  // ─── validateCategory ─────────────────────────────────────────

  describe('validateCategory', () => {
    it('should pass with a valid category body', async () => {
      const { req, nextArg } = await runMiddleware(validateCategory, {
        name: 'Food',
        type: 'expense',
      });

      expect(nextArg).toBeUndefined();
      expect(req.body).toEqual({ name: 'Food', type: 'expense' });
    });

    it('should forward a ZodError when name is empty', async () => {
      const { nextArg } = await runMiddleware(validateCategory, {
        name: '',
        type: 'expense',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when name is missing', async () => {
      const { nextArg } = await runMiddleware(validateCategory, {
        type: 'expense',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when type is invalid', async () => {
      const { nextArg } = await runMiddleware(validateCategory, {
        name: 'Food',
        type: 'savings',
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should accept all valid category types', async () => {
      for (const type of ['expense', 'income', 'investment']) {
        const { nextArg } = await runMiddleware(validateCategory, {
          name: 'Test',
          type,
        });
        expect(nextArg).toBeUndefined();
      }
    });

    it('should strip extra fields from the body', async () => {
      const { req, nextArg } = await runMiddleware(validateCategory, {
        name: 'Food',
        type: 'expense',
        extra: 'field',
      });

      expect(nextArg).toBeUndefined();
      expect(req.body).not.toHaveProperty('extra');
    });
  });

  // ─── validateUpdateRecurring ──────────────────────────────────

  describe('validateUpdateRecurring', () => {
    it('should pass with fromDate and an optional field', async () => {
      const { nextArg } = await runMiddleware(validateUpdateRecurring, {
        fromDate: '2026-03-01',
        amount: 15.99,
      });

      expect(nextArg).toBeUndefined();
    });

    it('should pass with fromDate and description', async () => {
      const { nextArg } = await runMiddleware(validateUpdateRecurring, {
        fromDate: '2026-03-01',
        description: 'Updated subscription',
      });

      expect(nextArg).toBeUndefined();
    });

    it('should forward a ZodError when fromDate is missing', async () => {
      const { nextArg } = await runMiddleware(validateUpdateRecurring, {
        amount: 15.99,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when fromDate has wrong format', async () => {
      const { nextArg } = await runMiddleware(validateUpdateRecurring, {
        fromDate: '01/03/2026',
        amount: 15.99,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });

    it('should forward a ZodError when amount is negative', async () => {
      const { nextArg } = await runMiddleware(validateUpdateRecurring, {
        fromDate: '2026-03-01',
        amount: -5,
      });

      expect(nextArg).toBeDefined();
      expect(nextArg.name).toBe('ZodError');
    });
  });
});
