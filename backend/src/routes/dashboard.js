import { Router } from 'express';

/**
 * Creates an Express router for the dashboard endpoint.
 *
 * @param {object} dashboardService - Dashboard service instance
 * @returns {import('express').Router} Configured dashboard router
 */
export function createDashboardRouter(dashboardService) {
  const router = Router();

  /**
   * GET /api/dashboard
   * Returns aggregated financial data: totals, balance,
   * category breakdown, monthly evolution, and recent transactions.
   *
   * Optional query filters: type, categoryId, startDate, endDate
   */
  router.get('/', async (req, res, next) => {
    try {
      const { type, categoryId, startDate, endDate } = req.query;
      const filters = {};
      if (type) filters.type = type;
      if (categoryId) filters.categoryId = Number(categoryId);
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const summary = await dashboardService.getSummary(filters);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
