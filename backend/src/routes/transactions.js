import { Router } from 'express';
import {
  validateTransaction,
  validateRecurringTransaction,
  validateUpdateRecurring,
} from '../middleware/validation.js';

/**
 * Creates an Express router for transaction endpoints.
 *
 * Recurring routes are registered before parameterised `/:id` routes
 * so that `/recurring` is not captured by the `:id` parameter.
 *
 * @param {object} transactionService - Transaction service instance
 * @returns {import('express').Router} Configured transaction router
 */
export function createTransactionRouter(transactionService) {
  const router = Router();

  // ── Recurring transaction routes (before /:id) ─────────────────

  /**
   * GET /api/transactions/recurring
   * Lists all active recurring transaction groups.
   */
  router.get('/recurring', async (req, res, next) => {
    try {
      const groups = await transactionService.getRecurringGroups();
      res.json(groups);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/transactions/recurring
   * Creates a recurring transaction (generates 12 monthly occurrences).
   */
  router.post('/recurring', validateRecurringTransaction, async (req, res, next) => {
    try {
      const result = await transactionService.createRecurring(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/transactions/recurring/:groupId
   * Cancels a recurring subscription.
   * Optional query param `fromDate` (YYYY-MM-DD) to only delete future occurrences.
   */
  router.delete('/recurring/:groupId', async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId);
      const fromDate = req.query.fromDate || undefined;
      await transactionService.cancelRecurring(groupId, fromDate);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  /**
   * PATCH /api/transactions/recurring/:groupId
   * Updates future occurrences of a recurring subscription.
   * Body must include `fromDate` and at least one field to update.
   */
  router.patch('/recurring/:groupId', validateUpdateRecurring, async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId);
      const { fromDate, ...data } = req.body;
      const updated = await transactionService.updateRecurring(groupId, fromDate, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // ── Standard CRUD routes ───────────────────────────────────────

  /**
   * GET /api/transactions
   * Lists transactions with optional filters.
   * Query params: type, categoryId, startDate, endDate
   */
  router.get('/', async (req, res, next) => {
    try {
      const { type, categoryId, startDate, endDate } = req.query;
      const today = new Date().toISOString().split('T')[0];
      const filters = {};
      if (type) filters.type = type;
      if (categoryId) filters.categoryId = Number(categoryId);

      // Clamp dates: never allow querying beyond today
      filters.startDate = startDate && startDate <= today ? startDate : undefined;
      filters.endDate = endDate && endDate <= today ? endDate : today;

      const transactions = await transactionService.getAll(filters);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/transactions/:id
   * Retrieves a single transaction by ID.
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const transaction = await transactionService.getById(id);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/transactions
   * Creates a new single transaction.
   */
  router.post('/', validateTransaction, async (req, res, next) => {
    try {
      const transaction = await transactionService.create(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/transactions/:id
   * Updates an existing transaction.
   */
  router.put('/:id', validateTransaction, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const transaction = await transactionService.update(id, req.body);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/transactions/:id
   * Deletes a transaction.
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await transactionService.delete(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
