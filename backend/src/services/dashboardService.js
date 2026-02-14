import { transactionRepository } from '../repositories/transactionRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';

/**
 * Creates a dashboard service bound to the given repositories.
 * @param {object} deps
 * @param {object} deps.transactionRepo - Transaction repository instance
 * @param {object} deps.categoryRepo - Category repository instance
 * @returns {object} Dashboard service with aggregation logic
 */
export function createDashboardService({ transactionRepo, categoryRepo }) {
  return {
    /**
     * Computes an aggregated financial summary.
     *
     * Returns:
     * - **totals**: sum of amounts grouped by type (income, expense, investment)
     * - **balance**: income − expense − investment
     * - **categoryBreakdown**: expense amounts grouped by category name, sorted descending
     * - **monthlyEvolution**: income/expense/investment per month (YYYY-MM), sorted ascending
     * - **recentTransactions**: the 5 most recent transactions with category names
     *
     * @param {object} [filters={}] - Optional filters forwarded to the transaction repository
     * @param {string} [filters.type] - Transaction type filter
     * @param {number} [filters.categoryId] - Category ID filter
     * @param {string} [filters.startDate] - Start date (YYYY-MM-DD)
     * @param {string} [filters.endDate] - End date (YYYY-MM-DD)
     * @returns {Promise<object>} Aggregated dashboard data
     */
    async getSummary(filters = {}) {
      const [transactions, categories] = await Promise.all([
        transactionRepo.findAll(filters),
        categoryRepo.findAll(),
      ]);

      // Build category lookup map (id → category)
      const categoryMap = {};
      for (const cat of categories) {
        categoryMap[cat.id] = cat;
      }

      // ── Totals by type ──────────────────────────────────────────
      const totals = { income: 0, expense: 0, investment: 0 };

      for (const tx of transactions) {
        totals[tx.type] = (totals[tx.type] || 0) + tx.amount;
      }

      const balance = totals.income - totals.expense - totals.investment;

      // ── Category breakdown (expenses only) ──────────────────────
      const categoryTotals = {};

      for (const tx of transactions) {
        if (tx.type === 'expense' && tx.categoryId) {
          const catName =
            categoryMap[tx.categoryId]?.name || 'Uncategorized';
          categoryTotals[catName] = (categoryTotals[catName] || 0) + tx.amount;
        }
      }

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      // ── Monthly evolution ───────────────────────────────────────
      const monthlyMap = {};

      for (const tx of transactions) {
        const month = tx.date.substring(0, 7); // YYYY-MM

        if (!monthlyMap[month]) {
          monthlyMap[month] = { month, income: 0, expense: 0, investment: 0 };
        }

        monthlyMap[month][tx.type] =
          (monthlyMap[month][tx.type] || 0) + tx.amount;
      }

      const monthlyEvolution = Object.values(monthlyMap).sort((a, b) =>
        a.month.localeCompare(b.month),
      );

      // ── Recent transactions (up to 5) ──────────────────────────
      const recentTransactions = transactions.slice(0, 5).map((tx) => ({
        ...tx,
        categoryName: tx.categoryId
          ? (categoryMap[tx.categoryId]?.name ?? null)
          : null,
      }));

      return {
        totals,
        balance,
        categoryBreakdown,
        monthlyEvolution,
        recentTransactions,
      };
    },
  };
}

/** Default dashboard service using the application repositories */
export const dashboardService = createDashboardService({
  transactionRepo: transactionRepository,
  categoryRepo: categoryRepository,
});
