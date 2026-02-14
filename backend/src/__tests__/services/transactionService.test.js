import { createTestDb } from '../helpers/testDb.js';
import { createCategoryRepository } from '../../repositories/categoryRepository.js';
import { createTransactionRepository } from '../../repositories/transactionRepository.js';
import { createTransactionService } from '../../services/transactionService.js';
import { NotFoundError, ValidationError } from '../../errors.js';

describe('transactionService', () => {
  let db;
  let sqlite;
  let service;
  let categoryRepo;

  /** Helper to create a category and return its ID */
  async function seedCategory(name = 'Food', type = 'expense') {
    const cat = await categoryRepo.create({ name, type });
    return cat.id;
  }

  beforeEach(() => {
    ({ db, sqlite } = createTestDb());
    categoryRepo = createCategoryRepository(db);
    const transactionRepo = createTransactionRepository(db);
    service = createTransactionService({ transactionRepo, categoryRepo });
  });

  afterEach(() => {
    sqlite.close();
  });

  // ─── getAll ──────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return an empty array when no transactions exist', async () => {
      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('should return all transactions', async () => {
      await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });
      await service.create({
        type: 'income',
        amount: 100,
        date: '2026-01-20',
      });

      const result = await service.getAll();

      expect(result).toHaveLength(2);
    });

    it('should pass filters to the repository', async () => {
      await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });
      await service.create({
        type: 'income',
        amount: 100,
        date: '2026-01-20',
      });

      const expenses = await service.getAll({ type: 'expense' });

      expect(expenses).toHaveLength(1);
      expect(expenses[0].type).toBe('expense');
    });
  });

  // ─── getById ─────────────────────────────────────────────────

  describe('getById', () => {
    it('should return a transaction by its ID', async () => {
      const created = await service.create({
        type: 'expense',
        amount: 25.5,
        description: 'Lunch',
        date: '2026-01-15',
      });

      const found = await service.getById(created.id);

      expect(found).toMatchObject({
        id: created.id,
        amount: 25.5,
        description: 'Lunch',
      });
    });

    it('should throw NotFoundError for a non-existent ID', async () => {
      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
      await expect(service.getById(999)).rejects.toThrow(
        'Transaction not found',
      );
    });
  });

  // ─── create ──────────────────────────────────────────────────

  describe('create', () => {
    it('should create a transaction and return it with an id', async () => {
      const tx = await service.create({
        type: 'expense',
        amount: 42,
        description: 'Groceries',
        date: '2026-02-01',
      });

      expect(tx).toMatchObject({
        id: expect.any(Number),
        type: 'expense',
        amount: 42,
        description: 'Groceries',
        date: '2026-02-01',
      });
    });

    it('should create a transaction with a valid category', async () => {
      const catId = await seedCategory('Food', 'expense');

      const tx = await service.create({
        type: 'expense',
        amount: 30,
        date: '2026-02-01',
        categoryId: catId,
      });

      expect(tx.categoryId).toBe(catId);
    });

    it('should throw ValidationError for a non-existent category', async () => {
      await expect(
        service.create({
          type: 'expense',
          amount: 30,
          date: '2026-02-01',
          categoryId: 999,
        }),
      ).rejects.toThrow(ValidationError);
      await expect(
        service.create({
          type: 'expense',
          amount: 30,
          date: '2026-02-01',
          categoryId: 999,
        }),
      ).rejects.toThrow('Category not found');
    });

    it('should default to today when no date is provided', async () => {
      const today = new Date().toISOString().split('T')[0];

      const tx = await service.create({
        type: 'income',
        amount: 100,
      });

      expect(tx.date).toBe(today);
    });
  });

  // ─── update ──────────────────────────────────────────────────

  describe('update', () => {
    it('should update a transaction amount', async () => {
      const created = await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });

      const updated = await service.update(created.id, { amount: 20 });

      expect(updated.amount).toBe(20);
    });

    it('should update multiple fields at once', async () => {
      const created = await service.create({
        type: 'expense',
        amount: 10,
        description: 'Before',
        date: '2026-01-15',
      });

      const updated = await service.update(created.id, {
        amount: 99,
        description: 'After',
      });

      expect(updated).toMatchObject({
        id: created.id,
        amount: 99,
        description: 'After',
      });
    });

    it('should throw NotFoundError for a non-existent ID', async () => {
      await expect(
        service.update(999, { amount: 1 }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for a non-existent category', async () => {
      const created = await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });

      await expect(
        service.update(created.id, { categoryId: 999 }),
      ).rejects.toThrow(ValidationError);
    });

    it('should allow updating to a valid category', async () => {
      const catId = await seedCategory('Food', 'expense');
      const created = await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });

      const updated = await service.update(created.id, { categoryId: catId });

      expect(updated.categoryId).toBe(catId);
    });
  });

  // ─── delete ──────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete a transaction', async () => {
      const created = await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });

      await service.delete(created.id);

      await expect(service.getById(created.id)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError for a non-existent ID', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ─── generateOccurrences ─────────────────────────────────────

  describe('generateOccurrences', () => {
    const baseTransaction = {
      type: 'expense',
      amount: 9.99,
      description: 'Netflix',
      date: '2026-01-15',
    };

    it('should generate 12 monthly occurrences by default', () => {
      const occurrences = service.generateOccurrences(
        baseTransaction,
        'monthly',
      );

      expect(occurrences).toHaveLength(12);
      expect(occurrences[0].date).toBe('2026-01-15');
      expect(occurrences[1].date).toBe('2026-02-15');
      expect(occurrences[11].date).toBe('2026-12-15');
    });

    it('should generate weekly occurrences', () => {
      const occurrences = service.generateOccurrences(
        baseTransaction,
        'weekly',
        4,
      );

      expect(occurrences).toHaveLength(4);
      expect(occurrences[0].date).toBe('2026-01-15');
      expect(occurrences[1].date).toBe('2026-01-22');
      expect(occurrences[2].date).toBe('2026-01-29');
      expect(occurrences[3].date).toBe('2026-02-05');
    });

    it('should generate annual occurrences', () => {
      const occurrences = service.generateOccurrences(
        baseTransaction,
        'annual',
        3,
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date).toBe('2026-01-15');
      expect(occurrences[1].date).toBe('2027-01-15');
      expect(occurrences[2].date).toBe('2028-01-15');
    });

    it('should preserve all base transaction fields in each occurrence', () => {
      const occurrences = service.generateOccurrences(
        baseTransaction,
        'monthly',
        2,
      );

      for (const occ of occurrences) {
        expect(occ).toMatchObject({
          type: 'expense',
          amount: 9.99,
          description: 'Netflix',
        });
      }
    });

    it('should allow custom count', () => {
      const occurrences = service.generateOccurrences(
        baseTransaction,
        'monthly',
        6,
      );

      expect(occurrences).toHaveLength(6);
    });
  });

  // ─── createRecurring ─────────────────────────────────────────

  describe('createRecurring', () => {
    it('should create 12 monthly transactions with a shared group ID', async () => {
      const result = await service.createRecurring({
        type: 'expense',
        amount: 14.99,
        description: 'Spotify',
        date: '2026-01-01',
        frequency: 'monthly',
      });

      expect(result.groupId).toEqual(expect.any(Number));
      expect(result.transactions).toHaveLength(12);

      // All should share the same group ID
      for (const tx of result.transactions) {
        expect(tx.recurringGroupId).toBe(result.groupId);
      }
    });

    it('should create transactions with correct dates', async () => {
      const result = await service.createRecurring({
        type: 'expense',
        amount: 9.99,
        description: 'Netflix',
        date: '2026-03-01',
        frequency: 'monthly',
      });

      const dates = result.transactions.map((tx) => tx.date);

      expect(dates[0]).toBe('2026-03-01');
      expect(dates[1]).toBe('2026-04-01');
      expect(dates[11]).toBe('2027-02-01');
    });

    it('should validate category exists', async () => {
      await expect(
        service.createRecurring({
          type: 'expense',
          amount: 10,
          date: '2026-01-01',
          frequency: 'monthly',
          categoryId: 999,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should create recurring transactions with a valid category', async () => {
      const catId = await seedCategory('Entertainment', 'expense');

      const result = await service.createRecurring({
        type: 'expense',
        amount: 14.99,
        description: 'Spotify',
        date: '2026-01-01',
        frequency: 'monthly',
        categoryId: catId,
      });

      for (const tx of result.transactions) {
        expect(tx.categoryId).toBe(catId);
      }
    });

    it('should default to today when no date is provided', async () => {
      const today = new Date().toISOString().split('T')[0];

      const result = await service.createRecurring({
        type: 'expense',
        amount: 5,
        frequency: 'monthly',
      });

      expect(result.transactions[0].date).toBe(today);
    });
  });

  // ─── getRecurringGroups ──────────────────────────────────────

  describe('getRecurringGroups', () => {
    it('should return an empty array when no recurring groups exist', async () => {
      // Create a non-recurring transaction
      await service.create({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });

      const groups = await service.getRecurringGroups();

      expect(groups).toEqual([]);
    });

    it('should return summary information for each recurring group', async () => {
      const result = await service.createRecurring({
        type: 'expense',
        amount: 14.99,
        description: 'Spotify',
        date: '2026-01-01',
        frequency: 'monthly',
      });

      const groups = await service.getRecurringGroups();

      expect(groups).toHaveLength(1);
      expect(groups[0]).toMatchObject({
        groupId: result.groupId,
        count: 12,
        type: 'expense',
        amount: 14.99,
        description: 'Spotify',
        firstDate: '2026-01-01',
        lastDate: '2026-12-01',
      });
    });

    it('should return multiple groups separately', async () => {
      await service.createRecurring({
        type: 'expense',
        amount: 14.99,
        description: 'Spotify',
        date: '2026-01-01',
        frequency: 'monthly',
      });
      await service.createRecurring({
        type: 'expense',
        amount: 9.99,
        description: 'Netflix',
        date: '2026-01-01',
        frequency: 'monthly',
      });

      const groups = await service.getRecurringGroups();

      expect(groups).toHaveLength(2);
      const descriptions = groups.map((g) => g.description);
      expect(descriptions).toContain('Spotify');
      expect(descriptions).toContain('Netflix');
    });
  });

  // ─── cancelRecurring ─────────────────────────────────────────

  describe('cancelRecurring', () => {
    it('should delete all occurrences when no fromDate is given', async () => {
      const { groupId } = await service.createRecurring({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
        frequency: 'monthly',
      });

      await service.cancelRecurring(groupId);

      const groups = await service.getRecurringGroups();
      expect(groups).toEqual([]);
    });

    it('should only delete future occurrences when fromDate is given', async () => {
      const { groupId } = await service.createRecurring({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
        frequency: 'monthly',
      });

      // Cancel from March onward — keeps Jan and Feb
      await service.cancelRecurring(groupId, '2026-03-01');

      const groups = await service.getRecurringGroups();
      expect(groups).toHaveLength(1);
      expect(groups[0].count).toBe(2);
      expect(groups[0].lastDate).toBe('2026-02-01');
    });

    it('should throw NotFoundError for a non-existent group', async () => {
      await expect(service.cancelRecurring(999)).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.cancelRecurring(999)).rejects.toThrow(
        'Recurring group not found',
      );
    });
  });

  // ─── updateRecurring ─────────────────────────────────────────

  describe('updateRecurring', () => {
    it('should update future occurrences from a given date', async () => {
      const { groupId } = await service.createRecurring({
        type: 'expense',
        amount: 10,
        description: 'Old plan',
        date: '2026-01-01',
        frequency: 'monthly',
      });

      // Update from March onward
      const updated = await service.updateRecurring(
        groupId,
        '2026-03-01',
        { amount: 20, description: 'New plan' },
      );

      expect(updated.length).toBe(10); // Mar through Dec = 10 occurrences

      for (const tx of updated) {
        expect(tx.amount).toBe(20);
        expect(tx.description).toBe('New plan');
      }
    });

    it('should not modify past occurrences', async () => {
      const { groupId, transactions } = await service.createRecurring({
        type: 'expense',
        amount: 10,
        description: 'Original',
        date: '2026-01-01',
        frequency: 'monthly',
      });

      await service.updateRecurring(groupId, '2026-03-01', { amount: 20 });

      // Verify January and February are unchanged
      const jan = await service.getById(transactions[0].id);
      const feb = await service.getById(transactions[1].id);

      expect(jan.amount).toBe(10);
      expect(feb.amount).toBe(10);
    });

    it('should throw NotFoundError for a non-existent group', async () => {
      await expect(
        service.updateRecurring(999, '2026-01-01', { amount: 50 }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
