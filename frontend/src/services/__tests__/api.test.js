import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to mock fetch before importing the api module
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock import.meta.env
vi.stubEnv('VITE_API_URL', 'http://localhost:3001/api');

const { api } = await import('../api');

/**
 * Helper to create a mock Response object.
 */
function mockResponse(body, { status = 200, ok = true } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  };
}

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── request wrapper behavior ──────────────────────────────────

  describe('request wrapper', () => {
    it('should set Content-Type header to application/json', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.getCategories();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should return null for 204 No Content responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('No body')),
      });

      const result = await api.deleteTransaction(1);

      expect(result).toBeNull();
    });

    it('should throw an error with server message on non-OK response', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(
          { error: 'Transaction not found' },
          { status: 404, ok: false },
        ),
      );

      await expect(api.getTransaction(999)).rejects.toThrow(
        'Transaction not found',
      );
    });

    it('should throw with HTTP status when no error message in body', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.getCategories()).rejects.toThrow('HTTP error: 500');
    });
  });

  // ─── Transactions ──────────────────────────────────────────────

  describe('getTransactions', () => {
    it('should call GET /transactions without params when no filters', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.getTransactions();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions',
        expect.any(Object),
      );
    });

    it('should append query string for provided filters', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.getTransactions({ type: 'expense', startDate: '2026-01-01' });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('type=expense');
      expect(url).toContain('startDate=2026-01-01');
    });

    it('should skip undefined, null, and empty string filter values', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.getTransactions({
        type: 'expense',
        categoryId: undefined,
        startDate: null,
        endDate: '',
      });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('type=expense');
      expect(url).not.toContain('categoryId');
      expect(url).not.toContain('startDate');
      expect(url).not.toContain('endDate');
    });
  });

  describe('getTransaction', () => {
    it('should call GET /transactions/:id', async () => {
      const tx = { id: 1, type: 'expense', amount: 42 };
      mockFetch.mockResolvedValue(mockResponse(tx));

      const result = await api.getTransaction(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/1',
        expect.any(Object),
      );
      expect(result).toEqual(tx);
    });
  });

  describe('createTransaction', () => {
    it('should call POST /transactions with JSON body', async () => {
      const data = { type: 'expense', amount: 42, date: '2026-02-14' };
      const created = { id: 1, ...data };
      mockFetch.mockResolvedValue(mockResponse(created));

      const result = await api.createTransaction(data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('updateTransaction', () => {
    it('should call PUT /transactions/:id with JSON body', async () => {
      const data = { amount: 99 };
      const updated = { id: 1, amount: 99 };
      mockFetch.mockResolvedValue(mockResponse(updated));

      const result = await api.updateTransaction(1, data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTransaction', () => {
    it('should call DELETE /transactions/:id', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204 });

      await api.deleteTransaction(5);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/5',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('createRecurringTransaction', () => {
    it('should call POST /transactions/recurring with JSON body', async () => {
      const data = {
        type: 'expense',
        amount: 9.99,
        date: '2026-03-01',
        frequency: 'monthly',
      };
      mockFetch.mockResolvedValue(mockResponse([{ id: 1 }]));

      await api.createRecurringTransaction(data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/recurring',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
    });
  });

  describe('getRecurringGroups', () => {
    it('should call GET /transactions/recurring', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.getRecurringGroups();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/recurring',
        expect.any(Object),
      );
    });
  });

  describe('cancelRecurring', () => {
    it('should call DELETE /transactions/recurring/:groupId', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204 });

      await api.cancelRecurring(42);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/recurring/42',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('should append fromDate query param when provided', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204 });

      await api.cancelRecurring(42, '2026-06-01');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/recurring/42?fromDate=2026-06-01',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('updateRecurring', () => {
    it('should call PATCH /transactions/recurring/:groupId', async () => {
      const data = { fromDate: '2026-06-01', amount: 12.99 };
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.updateRecurring(42, data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions/recurring/42',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      );
    });
  });

  // ─── Categories ────────────────────────────────────────────────

  describe('getCategories', () => {
    it('should call GET /categories', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      await api.getCategories();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/categories',
        expect.any(Object),
      );
    });
  });

  describe('createCategory', () => {
    it('should call POST /categories with JSON body', async () => {
      const data = { name: 'Food', type: 'expense' };
      mockFetch.mockResolvedValue(mockResponse({ id: 1, ...data }));

      await api.createCategory(data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/categories',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
    });
  });

  describe('updateCategory', () => {
    it('should call PUT /categories/:id with JSON body', async () => {
      const data = { name: 'Groceries' };
      mockFetch.mockResolvedValue(
        mockResponse({ id: 1, name: 'Groceries', type: 'expense' }),
      );

      await api.updateCategory(1, data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/categories/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      );
    });
  });

  describe('deleteCategory', () => {
    it('should call DELETE /categories/:id', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204 });

      await api.deleteCategory(3);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/categories/3',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  // ─── Dashboard ─────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('should call GET /dashboard without params when no filters', async () => {
      mockFetch.mockResolvedValue(mockResponse({}));

      await api.getDashboard();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/dashboard',
        expect.any(Object),
      );
    });

    it('should append query string for provided filters', async () => {
      mockFetch.mockResolvedValue(mockResponse({}));

      await api.getDashboard({ startDate: '2026-01-01', endDate: '2026-01-31' });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('startDate=2026-01-01');
      expect(url).toContain('endDate=2026-01-31');
    });

    it('should skip empty filter values', async () => {
      mockFetch.mockResolvedValue(mockResponse({}));

      await api.getDashboard({ type: '', startDate: null });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/dashboard',
        expect.any(Object),
      );
    });
  });
});
