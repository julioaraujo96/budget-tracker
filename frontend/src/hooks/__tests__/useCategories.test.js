import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCategories } from '../useCategories';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

import { api } from '@/services/api';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Food', type: 'expense' },
  { id: 2, name: 'Salary', type: 'income' },
  { id: 3, name: 'Stocks', type: 'investment' },
];

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCategories.mockResolvedValue(MOCK_CATEGORIES);
  });

  // ─── Initial fetch ─────────────────────────────────────────────

  describe('initial fetch', () => {
    it('should fetch categories on mount', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.getCategories).toHaveBeenCalledOnce();
      expect(result.current.categories).toEqual(MOCK_CATEGORIES);
    });

    it('should start with loading true', () => {
      const { result } = renderHook(() => useCategories());

      expect(result.current.loading).toBe(true);
    });

    it('should start with empty categories', () => {
      const { result } = renderHook(() => useCategories());

      expect(result.current.categories).toEqual([]);
    });

    it('should set error when fetch fails', async () => {
      api.getCategories.mockRejectedValue(new Error('Server down'));

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Server down');
      expect(result.current.categories).toEqual([]);
    });
  });

  // ─── createCategory ────────────────────────────────────────────

  describe('createCategory', () => {
    it('should add the new category to the local list', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newCat = { id: 4, name: 'Transport', type: 'expense' };
      api.createCategory.mockResolvedValue(newCat);

      let created;
      await act(async () => {
        created = await result.current.createCategory({
          name: 'Transport',
          type: 'expense',
        });
      });

      expect(created).toEqual(newCat);
      expect(api.createCategory).toHaveBeenCalledWith({
        name: 'Transport',
        type: 'expense',
      });
      expect(result.current.categories).toHaveLength(4);
      expect(result.current.categories[3]).toEqual(newCat);
    });
  });

  // ─── updateCategory ────────────────────────────────────────────

  describe('updateCategory', () => {
    it('should update the category in the local list', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = { id: 1, name: 'Groceries', type: 'expense' };
      api.updateCategory.mockResolvedValue(updated);

      await act(async () => {
        await result.current.updateCategory(1, { name: 'Groceries' });
      });

      expect(api.updateCategory).toHaveBeenCalledWith(1, {
        name: 'Groceries',
      });
      expect(result.current.categories[0].name).toBe('Groceries');
    });

    it('should not modify other categories', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = { id: 1, name: 'Groceries', type: 'expense' };
      api.updateCategory.mockResolvedValue(updated);

      await act(async () => {
        await result.current.updateCategory(1, { name: 'Groceries' });
      });

      expect(result.current.categories[1]).toEqual(MOCK_CATEGORIES[1]);
      expect(result.current.categories[2]).toEqual(MOCK_CATEGORIES[2]);
    });
  });

  // ─── deleteCategory ────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('should remove the category from the local list', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      api.deleteCategory.mockResolvedValue(null);

      await act(async () => {
        await result.current.deleteCategory(1);
      });

      expect(api.deleteCategory).toHaveBeenCalledWith(1);
      expect(result.current.categories).toHaveLength(2);
      expect(result.current.categories.find((c) => c.id === 1)).toBeUndefined();
    });

    it('should not affect other categories', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      api.deleteCategory.mockResolvedValue(null);

      await act(async () => {
        await result.current.deleteCategory(2);
      });

      expect(result.current.categories).toHaveLength(2);
      expect(result.current.categories[0].id).toBe(1);
      expect(result.current.categories[1].id).toBe(3);
    });
  });

  // ─── refresh ───────────────────────────────────────────────────

  describe('refresh', () => {
    it('should refetch categories from the API', async () => {
      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedList = [{ id: 1, name: 'Food', type: 'expense' }];
      api.getCategories.mockResolvedValue(updatedList);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.getCategories).toHaveBeenCalledTimes(2);
      expect(result.current.categories).toEqual(updatedList);
    });

    it('should clear previous errors on successful refresh', async () => {
      api.getCategories.mockRejectedValueOnce(new Error('fail'));

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.error).toBe('fail');
      });

      api.getCategories.mockResolvedValue(MOCK_CATEGORIES);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.categories).toEqual(MOCK_CATEGORIES);
    });
  });
});
