import express from 'express';
import { createTestDb } from './testDb.js';
import { createCategoryRepository } from '../../repositories/categoryRepository.js';
import { createTransactionRepository } from '../../repositories/transactionRepository.js';
import { createCategoryService } from '../../services/categoryService.js';
import { createTransactionService } from '../../services/transactionService.js';
import { createDashboardService } from '../../services/dashboardService.js';
import { createApiRouter } from '../../routes/index.js';
import { errorHandler } from '../../middleware/errorHandler.js';

/**
 * Creates a fully wired Express test application backed by an
 * in-memory SQLite database.
 *
 * Each call returns a fresh, isolated environment — safe for
 * parallel test suites.
 *
 * @returns {{
 *   app: import('express').Express,
 *   db: import('drizzle-orm/better-sqlite3').BetterSQLite3Database,
 *   sqlite: import('better-sqlite3').Database,
 *   categoryRepo: object,
 *   transactionRepo: object,
 * }}
 */
export function createTestApp() {
  const { db, sqlite } = createTestDb();

  const categoryRepo = createCategoryRepository(db);
  const transactionRepo = createTransactionRepository(db);

  const categoryService = createCategoryService({
    categoryRepo,
    transactionRepo,
  });
  const transactionService = createTransactionService({
    transactionRepo,
    categoryRepo,
  });
  const dashboardService = createDashboardService({
    transactionRepo,
    categoryRepo,
  });

  const app = express();
  app.use(express.json());
  app.use(
    '/api',
    createApiRouter({ categoryService, transactionService, dashboardService }),
  );
  app.use(errorHandler);

  return { app, db, sqlite, categoryRepo, transactionRepo };
}
