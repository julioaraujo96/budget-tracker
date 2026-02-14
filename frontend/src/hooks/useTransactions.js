import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for managing transactions state with CRUD operations.
 *
 * Provides a reactive list of transactions, loading/error states,
 * and functions to create, update, and delete transactions.
 *
 * @param {object} [initialFilters={}] - Initial filter criteria
 * @returns {object} Transactions state and mutation functions
 */
export function useTransactions(initialFilters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Fetches transactions from the API using current filters.
   */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /**
   * Creates a new single transaction.
   * @param {object} data - Transaction data
   * @returns {Promise<object>} Created transaction
   */
  const createTransaction = async (data) => {
    const newTransaction = await api.createTransaction(data);
    await fetchTransactions();
    return newTransaction;
  };

  /**
   * Creates a recurring transaction (generates 12 occurrences).
   * @param {object} data - Transaction data with frequency
   * @returns {Promise<Array>} Created occurrences
   */
  const createRecurringTransaction = async (data) => {
    const result = await api.createRecurringTransaction(data);
    await fetchTransactions();
    return result;
  };

  /**
   * Updates an existing transaction.
   * @param {number} id - Transaction ID
   * @param {object} data - Updated transaction data
   * @returns {Promise<object>} Updated transaction
   */
  const updateTransaction = async (id, data) => {
    const updated = await api.updateTransaction(id, data);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updated : t)),
    );
    return updated;
  };

  /**
   * Deletes a transaction.
   * @param {number} id - Transaction ID
   */
  const deleteTransaction = async (id) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchTransactions,
    createTransaction,
    createRecurringTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
