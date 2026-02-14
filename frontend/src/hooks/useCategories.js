import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for managing categories state with CRUD operations.
 *
 * Provides a reactive list of categories, loading/error states,
 * and functions to create, update, and delete categories.
 *
 * @returns {object} Categories state and mutation functions
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all categories from the API.
   */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Creates a new category.
   * @param {object} data - Category data (name, type)
   * @returns {Promise<object>} Created category
   */
  const createCategory = async (data) => {
    const newCategory = await api.createCategory(data);
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  /**
   * Updates an existing category.
   * @param {number} id - Category ID
   * @param {object} data - Updated category data
   * @returns {Promise<object>} Updated category
   */
  const updateCategory = async (id, data) => {
    const updated = await api.updateCategory(id, data);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? updated : c)),
    );
    return updated;
  };

  /**
   * Deletes a category.
   * @param {number} id - Category ID
   */
  const deleteCategory = async (id) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
