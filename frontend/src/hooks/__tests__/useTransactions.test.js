import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTransactions } from '../useTransactions';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    getTransactions: vi.fn(),
    createTransaction: vi.fn(),
    createRecurringTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  },
}));

import { api } from '@/services/api';

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: 'expense',
    amount: 42.5,
    description: 'Coffee',
    date: '2026-02-14',
    categoryId: 1,
  },
  {
    id: 2,
    type: 'income',
    amount: 5000,
    description: 'Salary',
    date: '2026-02-01',
    categoryId: 2,
  },
];

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTransactions.mockResolvedValue(MOCK_TRANSACTIONS);
  });

  // ─── Initial fetch ─────────────────────────────────────────────

  describe('initial fetch', () => {
    it('should fetch transactions on mount', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.getTransactions).toHaveBeenCalledWith({});
      expect(result.current.transactions).toEqual(MOCK_TRANSACTIONS);
    });

    it('should start with loading true', () => {
      const { result } = renderHook(() => useTransactions());

      expect(result.current.loading).toBe(true);
    });

    it('should pass initial filters to the API', async () => {
      const filters = { type: 'expense' };
      const { result } = renderHook(() => useTransactions(filters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.getTransactions).toHaveBeenCalledWith(filters);
    });

    it('should set error when fetch fails', async () => {
      api.getTransactions.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.transactions).toEqual([]);
    });
  });

  // ─── setFilters ────────────────────────────────────────────────

  describe('setFilters', () => {
    it('should refetch when filters change', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const filtered = [MOCK_TRANSACTIONS[0]];
      api.getTransactions.mockResolvedValue(filtered);

      await act(async () => {
        result.current.setFilters({ type: 'expense' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.getTransactions).toHaveBeenCalledWith({ type: 'expense' });
      expect(result.current.transactions).toEqual(filtered);
    });
  });

  // ─── createTransaction ─────────────────────────────────────────

  describe('createTransaction', () => {
    it('should call the API and refetch the list', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newTx = { id: 3, type: 'expense', amount: 15, date: '2026-02-15' };
      api.createTransaction.mockResolvedValue(newTx);
      api.getTransactions.mockResolvedValue([...MOCK_TRANSACTIONS, newTx]);

      let created;
      await act(async () => {
        created = await result.current.createTransaction({
          type: 'expense',
          amount: 15,
          date: '2026-02-15',
        });
      });

      expect(created).toEqual(newTx);
      expect(api.createTransaction).toHaveBeenCalledWith({
        type: 'expense',
        amount: 15,
        date: '2026-02-15',
      });
      // Should have refetched
      expect(api.getTransactions).toHaveBeenCalledTimes(2);
    });
  });

  // ─── createRecurringTransaction ────────────────────────────────

  describe('createRecurringTransaction', () => {
    it('should call the API and refetch the list', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const occurrences = [{ id: 10 }, { id: 11 }];
      api.createRecurringTransaction.mockResolvedValue(occurrences);
      api.getTransactions.mockResolvedValue(MOCK_TRANSACTIONS);

      let created;
      await act(async () => {
        created = await result.current.createRecurringTransaction({
          type: 'expense',
          amount: 9.99,
          date: '2026-03-01',
          frequency: 'monthly',
        });
      });

      expect(created).toEqual(occurrences);
      expect(api.createRecurringTransaction).toHaveBeenCalledWith({
        type: 'expense',
        amount: 9.99,
        date: '2026-03-01',
        frequency: 'monthly',
      });
    });
  });

  // ─── updateTransaction ─────────────────────────────────────────

  describe('updateTransaction', () => {
    it('should update the transaction in the local list optimistically', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = { ...MOCK_TRANSACTIONS[0], amount: 99.99 };
      api.updateTransaction.mockResolvedValue(updated);

      await act(async () => {
        await result.current.updateTransaction(1, { amount: 99.99 });
      });

      expect(api.updateTransaction).toHaveBeenCalledWith(1, { amount: 99.99 });
      expect(result.current.transactions[0].amount).toBe(99.99);
      // Should NOT have refetched (optimistic update instead)
      expect(api.getTransactions).toHaveBeenCalledTimes(1);
    });

    it('should not modify other transactions', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = { ...MOCK_TRANSACTIONS[0], amount: 99.99 };
      api.updateTransaction.mockResolvedValue(updated);

      await act(async () => {
        await result.current.updateTransaction(1, { amount: 99.99 });
      });

      expect(result.current.transactions[1]).toEqual(MOCK_TRANSACTIONS[1]);
    });
  });

  // ─── deleteTransaction ─────────────────────────────────────────

  describe('deleteTransaction', () => {
    it('should remove the transaction from the local list', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      api.deleteTransaction.mockResolvedValue(null);

      await act(async () => {
        await result.current.deleteTransaction(1);
      });

      expect(api.deleteTransaction).toHaveBeenCalledWith(1);
      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].id).toBe(2);
    });
  });

  // ─── refresh ───────────────────────────────────────────────────

  describe('refresh', () => {
    it('should refetch transactions from the API', async () => {
      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      api.getTransactions.mockResolvedValue([]);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.getTransactions).toHaveBeenCalledTimes(2);
      expect(result.current.transactions).toEqual([]);
    });

    it('should clear previous errors on refresh', async () => {
      api.getTransactions.mockRejectedValueOnce(new Error('fail'));

      const { result } = renderHook(() => useTransactions());

      await waitFor(() => {
        expect(result.current.error).toBe('fail');
      });

      api.getTransactions.mockResolvedValue(MOCK_TRANSACTIONS);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });
});
