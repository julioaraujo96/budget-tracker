import { Router } from 'express';
import { validateCategory } from '../middleware/validation.js';

/**
 * Creates an Express router for category endpoints.
 *
 * @param {object} categoryService - Category service instance
 * @returns {import('express').Router} Configured category router
 */
export function createCategoryRouter(categoryService) {
  const router = Router();

  /**
   * GET /api/categories
   * Lists all categories ordered by name.
   */
  router.get('/', async (req, res, next) => {
    try {
      const categories = await categoryService.getAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/categories
   * Creates a new category.
   */
  router.post('/', validateCategory, async (req, res, next) => {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/categories/:id
   * Updates an existing category.
   */
  router.put('/:id', validateCategory, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const category = await categoryService.update(id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/categories/:id
   * Deletes a category (fails if it has associated transactions).
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await categoryService.delete(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
