import { createTestDb } from '../helpers/testDb.js';
import { createCategoryRepository } from '../../repositories/categoryRepository.js';
import { createTransactionRepository } from '../../repositories/transactionRepository.js';
import { createCategoryService } from '../../services/categoryService.js';
import { NotFoundError, ValidationError } from '../../errors.js';

describe('categoryService', () => {
  let db;
  let sqlite;
  let service;
  let transactionRepo;

  beforeEach(() => {
    ({ db, sqlite } = createTestDb());
    const categoryRepo = createCategoryRepository(db);
    transactionRepo = createTransactionRepository(db);
    service = createCategoryService({ categoryRepo, transactionRepo });
  });

  afterEach(() => {
    sqlite.close();
  });

  // ─── getAll ──────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return an empty array when no categories exist', async () => {
      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all categories', async () => {
      await service.create({ name: 'Food', type: 'expense' });
      await service.create({ name: 'Salary', type: 'income' });

      const result = await service.getAll();

      expect(result).toHaveLength(2);
    });
  });

  // ─── getById ─────────────────────────────────────────────────

  describe('getById', () => {
    it('should return a category by its ID', async () => {
      const created = await service.create({ name: 'Food', type: 'expense' });

      const found = await service.getById(created.id);

      expect(found).toMatchObject({
        id: created.id,
        name: 'Food',
        type: 'expense',
      });
    });

    it('should throw NotFoundError for a non-existent ID', async () => {
      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
      await expect(service.getById(999)).rejects.toThrow('Category not found');
    });
  });

  // ─── create ──────────────────────────────────────────────────

  describe('create', () => {
    it('should create a category and return it with an id', async () => {
      const category = await service.create({
        name: 'Transport',
        type: 'expense',
      });

      expect(category).toMatchObject({
        id: expect.any(Number),
        name: 'Transport',
        type: 'expense',
      });
    });

    it('should persist the created category', async () => {
      const created = await service.create({
        name: 'Stocks',
        type: 'investment',
      });

      const found = await service.getById(created.id);
      expect(found.name).toBe('Stocks');
    });
  });

  // ─── update ──────────────────────────────────────────────────

  describe('update', () => {
    it('should update a category name', async () => {
      const created = await service.create({
        name: 'Foood',
        type: 'expense',
      });

      const updated = await service.update(created.id, { name: 'Food' });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Food',
        type: 'expense',
      });
    });

    it('should update a category type', async () => {
      const created = await service.create({
        name: 'Bonus',
        type: 'expense',
      });

      const updated = await service.update(created.id, { type: 'income' });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Bonus',
        type: 'income',
      });
    });

    it('should throw NotFoundError when updating a non-existent ID', async () => {
      await expect(
        service.update(999, { name: 'Ghost' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── delete ──────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete a category with no associated transactions', async () => {
      const created = await service.create({
        name: 'Food',
        type: 'expense',
      });

      await service.delete(created.id);

      await expect(service.getById(created.id)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError when deleting a non-existent ID', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
      await expect(service.delete(999)).rejects.toThrow('Category not found');
    });

    it('should throw ValidationError when category has associated transactions', async () => {
      const category = await service.create({
        name: 'Food',
        type: 'expense',
      });

      // Create a transaction linked to this category
      await transactionRepo.create({
        type: 'expense',
        amount: 25,
        description: 'Lunch',
        date: '2026-01-15',
        categoryId: category.id,
      });

      await expect(service.delete(category.id)).rejects.toThrow(
        ValidationError,
      );
      await expect(service.delete(category.id)).rejects.toThrow(
        'Cannot delete category with associated transactions',
      );
    });

    it('should allow deletion after all associated transactions are removed', async () => {
      const category = await service.create({
        name: 'Food',
        type: 'expense',
      });

      const tx = await transactionRepo.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
        categoryId: category.id,
      });

      // Remove the transaction first
      await transactionRepo.delete(tx.id);

      // Now deletion should succeed
      await expect(service.delete(category.id)).resolves.not.toThrow();
    });

    it('should not affect other categories when deleting one', async () => {
      const food = await service.create({ name: 'Food', type: 'expense' });
      const salary = await service.create({ name: 'Salary', type: 'income' });

      await service.delete(food.id);

      const remaining = await service.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(salary.id);
    });
  });
});
