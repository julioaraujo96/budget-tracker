import { createTestDb } from '../helpers/testDb.js';
import { createCategoryRepository } from '../../repositories/categoryRepository.js';

describe('categoryRepository', () => {
  let db;
  let sqlite;
  let repo;

  beforeEach(() => {
    ({ db, sqlite } = createTestDb());
    repo = createCategoryRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('create', () => {
    it('should create a category and return it with an id', async () => {
      const category = await repo.create({ name: 'Food', type: 'expense' });

      expect(category).toMatchObject({
        id: expect.any(Number),
        name: 'Food',
        type: 'expense',
      });
    });

    it('should auto-increment IDs for multiple categories', async () => {
      const first = await repo.create({ name: 'Food', type: 'expense' });
      const second = await repo.create({ name: 'Salary', type: 'income' });

      expect(second.id).toBeGreaterThan(first.id);
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no categories exist', async () => {
      const result = await repo.findAll();

      expect(result).toEqual([]);
    });

    it('should return all categories ordered by name', async () => {
      await repo.create({ name: 'Transport', type: 'expense' });
      await repo.create({ name: 'Food', type: 'expense' });
      await repo.create({ name: 'Salary', type: 'income' });

      const result = await repo.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Food');
      expect(result[1].name).toBe('Salary');
      expect(result[2].name).toBe('Transport');
    });

    it('should return categories of all types', async () => {
      await repo.create({ name: 'Food', type: 'expense' });
      await repo.create({ name: 'Salary', type: 'income' });
      await repo.create({ name: 'Stocks', type: 'investment' });

      const result = await repo.findAll();
      const types = result.map((c) => c.type);

      expect(types).toContain('expense');
      expect(types).toContain('income');
      expect(types).toContain('investment');
    });
  });

  describe('findById', () => {
    it('should return a category by its ID', async () => {
      const created = await repo.create({ name: 'Food', type: 'expense' });

      const found = await repo.findById(created.id);

      expect(found).toMatchObject({
        id: created.id,
        name: 'Food',
        type: 'expense',
      });
    });

    it('should return undefined for a non-existent ID', async () => {
      const found = await repo.findById(999);

      expect(found).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a category name', async () => {
      const created = await repo.create({ name: 'Foood', type: 'expense' });

      const updated = await repo.update(created.id, { name: 'Food' });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Food',
        type: 'expense',
      });
    });

    it('should update a category type', async () => {
      const created = await repo.create({ name: 'Bonus', type: 'expense' });

      const updated = await repo.update(created.id, { type: 'income' });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Bonus',
        type: 'income',
      });
    });

    it('should update multiple fields at once', async () => {
      const created = await repo.create({ name: 'Old Name', type: 'expense' });

      const updated = await repo.update(created.id, {
        name: 'New Name',
        type: 'income',
      });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'New Name',
        type: 'income',
      });
    });

    it('should return undefined when updating a non-existent ID', async () => {
      const updated = await repo.update(999, { name: 'Ghost' });

      expect(updated).toBeUndefined();
    });

    it('should persist the update in the database', async () => {
      const created = await repo.create({ name: 'Food', type: 'expense' });
      await repo.update(created.id, { name: 'Groceries' });

      const found = await repo.findById(created.id);

      expect(found.name).toBe('Groceries');
    });
  });

  describe('delete', () => {
    it('should delete an existing category', async () => {
      const created = await repo.create({ name: 'Food', type: 'expense' });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should not affect other categories when deleting one', async () => {
      const food = await repo.create({ name: 'Food', type: 'expense' });
      const salary = await repo.create({ name: 'Salary', type: 'income' });

      await repo.delete(food.id);

      const remaining = await repo.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(salary.id);
    });

    it('should not throw when deleting a non-existent ID', async () => {
      await expect(repo.delete(999)).resolves.not.toThrow();
    });
  });
});
