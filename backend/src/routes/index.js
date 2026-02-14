import { Router } from 'express';
import { createCategoryRouter } from './categories.js';
import { createTransactionRouter } from './transactions.js';
import { createDashboardRouter } from './dashboard.js';

/**
 * Creates the top-level API router, mounting all sub-routers.
 *
 * @param {object} services
 * @param {object} services.categoryService    - Category service instance
 * @param {object} services.transactionService - Transaction service instance
 * @param {object} services.dashboardService   - Dashboard service instance
 * @returns {import('express').Router} Router mounted at /api
 */
export function createApiRouter({ categoryService, transactionService, dashboardService }) {
  const router = Router();

  router.use('/categories', createCategoryRouter(categoryService));
  router.use('/transactions', createTransactionRouter(transactionService));
  router.use('/dashboard', createDashboardRouter(dashboardService));

  return router;
}
