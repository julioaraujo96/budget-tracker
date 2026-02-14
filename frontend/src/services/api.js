const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with JSON parsing and error handling.
 *
 * @param {string} endpoint - API path relative to BASE_URL (e.g. '/transactions')
 * @param {RequestInit} [options={}] - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} When the response is not OK
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);

  // DELETE responses with 204 have no body
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // ── Transactions ──────────────────────────────────────────────────

  /**
   * Lists transactions with optional filters.
   * @param {object} [filters={}] - Query filters (type, categoryId, startDate, endDate)
   * @returns {Promise<Array>} Array of transaction objects
   */
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    return request(`/transactions${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieves a single transaction by ID.
   * @param {number} id - Transaction ID
   * @returns {Promise<object>} Transaction object
   */
  getTransaction: (id) => request(`/transactions/${id}`),

  /**
   * Creates a new single transaction.
   * @param {object} data - Transaction data (type, amount, description, date, categoryId)
   * @returns {Promise<object>} Created transaction
   */
  createTransaction: (data) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Updates an existing transaction.
   * @param {number} id - Transaction ID
   * @param {object} data - Updated transaction data
   * @returns {Promise<object>} Updated transaction
   */
  updateTransaction: (id, data) =>
    request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Deletes a transaction.
   * @param {number} id - Transaction ID
   * @returns {Promise<null>}
   */
  deleteTransaction: (id) =>
    request(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Creates a recurring transaction (generates 12 occurrences).
   * @param {object} data - Transaction data with a `frequency` field
   * @returns {Promise<Array>} Array of created occurrences
   */
  createRecurringTransaction: (data) =>
    request('/transactions/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Lists active recurring transaction groups.
   * @returns {Promise<Array>} Array of recurring group objects
   */
  getRecurringGroups: () => request('/transactions/recurring'),

  /**
   * Cancels a recurring subscription.
   * @param {number} groupId - Recurring group ID
   * @param {string} [fromDate] - Optional cutoff date (YYYY-MM-DD)
   * @returns {Promise<null>}
   */
  cancelRecurring: (groupId, fromDate) => {
    const qs = fromDate ? `?fromDate=${fromDate}` : '';
    return request(`/transactions/recurring/${groupId}${qs}`, {
      method: 'DELETE',
    });
  },

  /**
   * Updates future occurrences of a recurring subscription.
   * @param {number} groupId - Recurring group ID
   * @param {object} data - Fields to update (must include fromDate)
   * @returns {Promise<Array>} Updated occurrences
   */
  updateRecurring: (groupId, data) =>
    request(`/transactions/recurring/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ── Categories ────────────────────────────────────────────────────

  /**
   * Lists all categories.
   * @returns {Promise<Array>} Array of category objects
   */
  getCategories: () => request('/categories'),

  /**
   * Creates a new category.
   * @param {object} data - Category data (name, type)
   * @returns {Promise<object>} Created category
   */
  createCategory: (data) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Updates an existing category.
   * @param {number} id - Category ID
   * @param {object} data - Updated category data
   * @returns {Promise<object>} Updated category
   */
  updateCategory: (id, data) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Deletes a category.
   * @param {number} id - Category ID
   * @returns {Promise<null>}
   */
  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // ── Dashboard ─────────────────────────────────────────────────────

  /**
   * Fetches aggregated dashboard data.
   * @param {object} [filters={}] - Optional filters (type, categoryId, startDate, endDate)
   * @returns {Promise<object>} Dashboard summary (totals, balance, categoryBreakdown, monthlyEvolution, recentTransactions)
   */
  getDashboard: (filters = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    return request(`/dashboard${qs ? `?${qs}` : ''}`);
  },
};
