import { createTestDb } from '../helpers/testDb.js';
import { createTransactionRepository } from '../../repositories/transactionRepository.js';
import { createCategoryRepository } from '../../repositories/categoryRepository.js';

describe('transactionRepository', () => {
  let db;
  let sqlite;
  let repo;
  let categoryRepo;

  /** Helper to create a category and return its ID */
  async function seedCategory(name = 'Food', type = 'expense') {
    const cat = await categoryRepo.create({ name, type });
    return cat.id;
  }

  /** Helper to create a transaction with sensible defaults */
  async function seedTransaction(overrides = {}) {
    return repo.create({
      type: 'expense',
      amount: 50.0,
      description: 'Test transaction',
      date: '2026-01-15',
      ...overrides,
    });
  }

  beforeEach(() => {
    ({ db, sqlite } = createTestDb());
    repo = createTransactionRepository(db);
    categoryRepo = createCategoryRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ─── CRUD ───────────────────────────────────────────────────

  describe('create', () => {
    it('should create a transaction and return it with an id', async () => {
      const tx = await repo.create({
        type: 'expense',
        amount: 25.5,
        description: 'Lunch',
        date: '2026-01-10',
      });

      expect(tx).toMatchObject({
        id: expect.any(Number),
        type: 'expense',
        amount: 25.5,
        description: 'Lunch',
        date: '2026-01-10',
      });
    });

    it('should create a transaction with a category reference', async () => {
      const catId = await seedCategory();

      const tx = await repo.create({
        type: 'expense',
        amount: 30,
        description: 'Groceries',
        date: '2026-02-01',
        categoryId: catId,
      });

      expect(tx.categoryId).toBe(catId);
    });

    it('should create a transaction with a recurring group ID', async () => {
      const tx = await repo.create({
        type: 'expense',
        amount: 9.99,
        description: 'Netflix',
        date: '2026-01-01',
        recurringGroupId: 12345,
      });

      expect(tx.recurringGroupId).toBe(12345);
    });

    it('should allow null description', async () => {
      const tx = await repo.create({
        type: 'income',
        amount: 100,
        date: '2026-03-01',
      });

      expect(tx.description).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a transaction by ID', async () => {
      const created = await seedTransaction();

      const found = await repo.findById(created.id);

      expect(found).toMatchObject({
        id: created.id,
        type: 'expense',
        amount: 50.0,
      });
    });

    it('should return undefined for a non-existent ID', async () => {
      const found = await repo.findById(999);

      expect(found).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a transaction amount', async () => {
      const created = await seedTransaction({ amount: 10 });

      const updated = await repo.update(created.id, { amount: 20 });

      expect(updated.amount).toBe(20);
    });

    it('should update multiple fields at once', async () => {
      const created = await seedTransaction();

      const updated = await repo.update(created.id, {
        description: 'Updated',
        amount: 99.99,
        date: '2026-06-15',
      });

      expect(updated).toMatchObject({
        id: created.id,
        description: 'Updated',
        amount: 99.99,
        date: '2026-06-15',
      });
    });

    it('should return undefined when updating a non-existent ID', async () => {
      const updated = await repo.update(999, { amount: 1 });

      expect(updated).toBeUndefined();
    });

    it('should persist the update in the database', async () => {
      const created = await seedTransaction({ description: 'Before' });
      await repo.update(created.id, { description: 'After' });

      const found = await repo.findById(created.id);

      expect(found.description).toBe('After');
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      const created = await seedTransaction();

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should not affect other transactions', async () => {
      const tx1 = await seedTransaction({ description: 'Keep' });
      const tx2 = await seedTransaction({ description: 'Remove' });

      await repo.delete(tx2.id);

      const remaining = await repo.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(tx1.id);
    });

    it('should not throw when deleting a non-existent ID', async () => {
      await expect(repo.delete(999)).resolves.not.toThrow();
    });
  });

  // ─── findAll with filters ──────────────────────────────────

  describe('findAll', () => {
    it('should return an empty array when no transactions exist', async () => {
      const result = await repo.findAll();

      expect(result).toEqual([]);
    });

    it('should return all transactions ordered by date descending', async () => {
      await seedTransaction({ date: '2026-01-01', description: 'Oldest' });
      await seedTransaction({ date: '2026-03-01', description: 'Newest' });
      await seedTransaction({ date: '2026-02-01', description: 'Middle' });

      const result = await repo.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].description).toBe('Newest');
      expect(result[1].description).toBe('Middle');
      expect(result[2].description).toBe('Oldest');
    });

    describe('type filter', () => {
      it('should filter by transaction type', async () => {
        await seedTransaction({ type: 'expense', description: 'Lunch' });
        await seedTransaction({ type: 'income', description: 'Salary' });
        await seedTransaction({ type: 'investment', description: 'ETF' });

        const expenses = await repo.findAll({ type: 'expense' });

        expect(expenses).toHaveLength(1);
        expect(expenses[0].description).toBe('Lunch');
      });
    });

    describe('categoryId filter', () => {
      it('should filter by category ID', async () => {
        const foodId = await seedCategory('Food', 'expense');
        const salaryId = await seedCategory('Salary', 'income');

        await seedTransaction({ categoryId: foodId, description: 'Groceries' });
        await seedTransaction({ categoryId: salaryId, description: 'Pay' });
        await seedTransaction({ description: 'No category' });

        const result = await repo.findAll({ categoryId: foodId });

        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('Groceries');
      });
    });

    describe('date range filters', () => {
      beforeEach(async () => {
        await seedTransaction({ date: '2026-01-15', description: 'January' });
        await seedTransaction({ date: '2026-02-15', description: 'February' });
        await seedTransaction({ date: '2026-03-15', description: 'March' });
      });

      it('should filter by start date (inclusive)', async () => {
        const result = await repo.findAll({ startDate: '2026-02-15' });

        expect(result).toHaveLength(2);
        const descriptions = result.map((t) => t.description);
        expect(descriptions).toContain('February');
        expect(descriptions).toContain('March');
      });

      it('should filter by end date (inclusive)', async () => {
        const result = await repo.findAll({ endDate: '2026-02-15' });

        expect(result).toHaveLength(2);
        const descriptions = result.map((t) => t.description);
        expect(descriptions).toContain('January');
        expect(descriptions).toContain('February');
      });

      it('should filter by date range', async () => {
        const result = await repo.findAll({
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        });

        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('February');
      });
    });

    describe('combined filters', () => {
      it('should apply multiple filters simultaneously', async () => {
        const foodId = await seedCategory('Food', 'expense');

        await seedTransaction({
          type: 'expense',
          categoryId: foodId,
          date: '2026-01-10',
          description: 'Match',
        });
        await seedTransaction({
          type: 'expense',
          categoryId: foodId,
          date: '2026-03-10',
          description: 'Wrong date',
        });
        await seedTransaction({
          type: 'income',
          date: '2026-01-10',
          description: 'Wrong type',
        });

        const result = await repo.findAll({
          type: 'expense',
          categoryId: foodId,
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        });

        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('Match');
      });
    });
  });

  // ─── Recurring group operations ────────────────────────────

  describe('findByGroupId', () => {
    it('should return all transactions in a recurring group ordered by date', async () => {
      const groupId = 100;

      await seedTransaction({
        date: '2026-03-01',
        recurringGroupId: groupId,
        description: 'March',
      });
      await seedTransaction({
        date: '2026-01-01',
        recurringGroupId: groupId,
        description: 'January',
      });
      await seedTransaction({
        date: '2026-02-01',
        recurringGroupId: groupId,
        description: 'February',
      });
      // Different group
      await seedTransaction({
        date: '2026-01-01',
        recurringGroupId: 999,
        description: 'Other',
      });

      const result = await repo.findByGroupId(groupId);

      expect(result).toHaveLength(3);
      expect(result[0].description).toBe('January');
      expect(result[1].description).toBe('February');
      expect(result[2].description).toBe('March');
    });

    it('should return an empty array for a non-existent group', async () => {
      const result = await repo.findByGroupId(999);

      expect(result).toEqual([]);
    });
  });

  describe('deleteByGroupId', () => {
    it('should delete all transactions in a group when no fromDate is given', async () => {
      const groupId = 200;

      await seedTransaction({ recurringGroupId: groupId, date: '2026-01-01' });
      await seedTransaction({ recurringGroupId: groupId, date: '2026-02-01' });
      await seedTransaction({ recurringGroupId: groupId, date: '2026-03-01' });

      await repo.deleteByGroupId(groupId);

      const remaining = await repo.findByGroupId(groupId);
      expect(remaining).toEqual([]);
    });

    it('should only delete future occurrences when fromDate is given', async () => {
      const groupId = 300;

      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-01-01',
        description: 'Past',
      });
      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-02-01',
        description: 'Current',
      });
      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-03-01',
        description: 'Future',
      });

      await repo.deleteByGroupId(groupId, '2026-02-01');

      const remaining = await repo.findByGroupId(groupId);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].description).toBe('Past');
    });

    it('should not affect transactions in other groups', async () => {
      const group1 = 400;
      const group2 = 401;

      await seedTransaction({ recurringGroupId: group1, date: '2026-01-01' });
      await seedTransaction({ recurringGroupId: group2, date: '2026-01-01' });

      await repo.deleteByGroupId(group1);

      const group2Remaining = await repo.findByGroupId(group2);
      expect(group2Remaining).toHaveLength(1);
    });
  });

  describe('updateFutureByGroupId', () => {
    it('should update only future transactions in a group', async () => {
      const groupId = 500;

      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-01-01',
        amount: 10,
        description: 'Past',
      });
      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-02-01',
        amount: 10,
        description: 'On date',
      });
      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-03-01',
        amount: 10,
        description: 'Future',
      });

      const updated = await repo.updateFutureByGroupId(groupId, '2026-02-01', {
        amount: 20,
      });

      expect(updated).toHaveLength(2);

      // Verify the past transaction was not modified
      const all = await repo.findByGroupId(groupId);
      const past = all.find((t) => t.description === 'Past');
      const onDate = all.find((t) => t.description === 'On date');
      const future = all.find((t) => t.description === 'Future');

      expect(past.amount).toBe(10);
      expect(onDate.amount).toBe(20);
      expect(future.amount).toBe(20);
    });

    it('should update multiple fields at once', async () => {
      const groupId = 600;

      await seedTransaction({
        recurringGroupId: groupId,
        date: '2026-02-01',
        amount: 10,
        description: 'Original',
      });

      const updated = await repo.updateFutureByGroupId(groupId, '2026-01-01', {
        amount: 25,
        description: 'Updated subscription',
      });

      expect(updated).toHaveLength(1);
      expect(updated[0]).toMatchObject({
        amount: 25,
        description: 'Updated subscription',
      });
    });

    it('should return empty array when no transactions match', async () => {
      const updated = await repo.updateFutureByGroupId(999, '2026-01-01', {
        amount: 50,
      });

      expect(updated).toEqual([]);
    });
  });

  // ─── existsByCategoryId ────────────────────────────────────

  describe('existsByCategoryId', () => {
    it('should return true when transactions reference the category', async () => {
      const catId = await seedCategory('Food', 'expense');
      await seedTransaction({ categoryId: catId });

      const exists = await repo.existsByCategoryId(catId);

      expect(exists).toBe(true);
    });

    it('should return false when no transactions reference the category', async () => {
      const catId = await seedCategory('Empty', 'expense');

      const exists = await repo.existsByCategoryId(catId);

      expect(exists).toBe(false);
    });

    it('should return false for a non-existent category ID', async () => {
      const exists = await repo.existsByCategoryId(999);

      expect(exists).toBe(false);
    });
  });
});
