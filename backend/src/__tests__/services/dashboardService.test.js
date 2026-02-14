import { createTestDb } from '../helpers/testDb.js';
import { createCategoryRepository } from '../../repositories/categoryRepository.js';
import { createTransactionRepository } from '../../repositories/transactionRepository.js';
import { createDashboardService } from '../../services/dashboardService.js';

describe('dashboardService', () => {
  let db;
  let sqlite;
  let service;
  let categoryRepo;
  let transactionRepo;

  /** Helper to create a category and return its ID */
  async function seedCategory(name, type) {
    const cat = await categoryRepo.create({ name, type });
    return cat.id;
  }

  /** Helper to create a transaction with sensible defaults */
  async function seedTransaction(overrides = {}) {
    return transactionRepo.create({
      type: 'expense',
      amount: 50,
      description: 'Test',
      date: '2026-01-15',
      ...overrides,
    });
  }

  beforeEach(() => {
    ({ db, sqlite } = createTestDb());
    categoryRepo = createCategoryRepository(db);
    transactionRepo = createTransactionRepository(db);
    service = createDashboardService({ transactionRepo, categoryRepo });
  });

  afterEach(() => {
    sqlite.close();
  });

  // ─── Empty state ─────────────────────────────────────────────

  describe('empty state', () => {
    it('should return zeroed totals when no transactions exist', async () => {
      const summary = await service.getSummary();

      expect(summary.totals).toEqual({
        income: 0,
        expense: 0,
        investment: 0,
      });
    });

    it('should return zero balance when no transactions exist', async () => {
      const summary = await service.getSummary();

      expect(summary.balance).toBe(0);
    });

    it('should return empty arrays for breakdowns', async () => {
      const summary = await service.getSummary();

      expect(summary.categoryBreakdown).toEqual([]);
      expect(summary.monthlyEvolution).toEqual([]);
      expect(summary.recentTransactions).toEqual([]);
    });
  });

  // ─── Totals by type ──────────────────────────────────────────

  describe('totals', () => {
    it('should compute totals by transaction type', async () => {
      await seedTransaction({ type: 'income', amount: 3000 });
      await seedTransaction({ type: 'income', amount: 500 });
      await seedTransaction({ type: 'expense', amount: 200 });
      await seedTransaction({ type: 'expense', amount: 100 });
      await seedTransaction({ type: 'investment', amount: 400 });

      const summary = await service.getSummary();

      expect(summary.totals).toEqual({
        income: 3500,
        expense: 300,
        investment: 400,
      });
    });
  });

  // ─── Balance ─────────────────────────────────────────────────

  describe('balance', () => {
    it('should calculate balance as income - expense - investment', async () => {
      await seedTransaction({ type: 'income', amount: 5000 });
      await seedTransaction({ type: 'expense', amount: 1500 });
      await seedTransaction({ type: 'investment', amount: 500 });

      const summary = await service.getSummary();

      expect(summary.balance).toBe(3000);
    });

    it('should return a negative balance when expenses exceed income', async () => {
      await seedTransaction({ type: 'income', amount: 1000 });
      await seedTransaction({ type: 'expense', amount: 2000 });

      const summary = await service.getSummary();

      expect(summary.balance).toBe(-1000);
    });
  });

  // ─── Category breakdown ──────────────────────────────────────

  describe('categoryBreakdown', () => {
    it('should group expense amounts by category name', async () => {
      const foodId = await seedCategory('Food', 'expense');
      const transportId = await seedCategory('Transport', 'expense');

      await seedTransaction({
        type: 'expense',
        amount: 100,
        categoryId: foodId,
      });
      await seedTransaction({
        type: 'expense',
        amount: 50,
        categoryId: foodId,
      });
      await seedTransaction({
        type: 'expense',
        amount: 75,
        categoryId: transportId,
      });

      const summary = await service.getSummary();

      expect(summary.categoryBreakdown).toHaveLength(2);
      expect(summary.categoryBreakdown[0]).toEqual({
        name: 'Food',
        amount: 150,
      });
      expect(summary.categoryBreakdown[1]).toEqual({
        name: 'Transport',
        amount: 75,
      });
    });

    it('should be sorted by amount descending', async () => {
      const cheapId = await seedCategory('Cheap', 'expense');
      const expensiveId = await seedCategory('Expensive', 'expense');

      await seedTransaction({
        type: 'expense',
        amount: 10,
        categoryId: cheapId,
      });
      await seedTransaction({
        type: 'expense',
        amount: 500,
        categoryId: expensiveId,
      });

      const summary = await service.getSummary();

      expect(summary.categoryBreakdown[0].name).toBe('Expensive');
      expect(summary.categoryBreakdown[1].name).toBe('Cheap');
    });

    it('should only include expense transactions in the breakdown', async () => {
      const salaryId = await seedCategory('Salary', 'income');
      const foodId = await seedCategory('Food', 'expense');

      await seedTransaction({
        type: 'income',
        amount: 3000,
        categoryId: salaryId,
      });
      await seedTransaction({
        type: 'expense',
        amount: 100,
        categoryId: foodId,
      });

      const summary = await service.getSummary();

      expect(summary.categoryBreakdown).toHaveLength(1);
      expect(summary.categoryBreakdown[0].name).toBe('Food');
    });

    it('should exclude expenses without a category', async () => {
      const foodId = await seedCategory('Food', 'expense');

      await seedTransaction({
        type: 'expense',
        amount: 100,
        categoryId: foodId,
      });
      await seedTransaction({
        type: 'expense',
        amount: 50,
        // No category
      });

      const summary = await service.getSummary();

      expect(summary.categoryBreakdown).toHaveLength(1);
      expect(summary.categoryBreakdown[0]).toEqual({
        name: 'Food',
        amount: 100,
      });
    });
  });

  // ─── Monthly evolution ───────────────────────────────────────

  describe('monthlyEvolution', () => {
    it('should group transactions by month (YYYY-MM)', async () => {
      await seedTransaction({
        type: 'income',
        amount: 3000,
        date: '2026-01-05',
      });
      await seedTransaction({
        type: 'expense',
        amount: 200,
        date: '2026-01-20',
      });
      await seedTransaction({
        type: 'income',
        amount: 3000,
        date: '2026-02-05',
      });
      await seedTransaction({
        type: 'expense',
        amount: 300,
        date: '2026-02-15',
      });
      await seedTransaction({
        type: 'investment',
        amount: 500,
        date: '2026-02-28',
      });

      const summary = await service.getSummary();

      expect(summary.monthlyEvolution).toHaveLength(2);
      expect(summary.monthlyEvolution[0]).toEqual({
        month: '2026-01',
        income: 3000,
        expense: 200,
        investment: 0,
      });
      expect(summary.monthlyEvolution[1]).toEqual({
        month: '2026-02',
        income: 3000,
        expense: 300,
        investment: 500,
      });
    });

    it('should be sorted by month ascending', async () => {
      await seedTransaction({ date: '2026-03-01', type: 'expense' });
      await seedTransaction({ date: '2026-01-01', type: 'expense' });
      await seedTransaction({ date: '2026-02-01', type: 'expense' });

      const summary = await service.getSummary();

      expect(summary.monthlyEvolution[0].month).toBe('2026-01');
      expect(summary.monthlyEvolution[1].month).toBe('2026-02');
      expect(summary.monthlyEvolution[2].month).toBe('2026-03');
    });
  });

  // ─── Recent transactions ─────────────────────────────────────

  describe('recentTransactions', () => {
    it('should return up to 5 most recent transactions', async () => {
      for (let i = 1; i <= 8; i++) {
        await seedTransaction({
          date: `2026-01-${String(i).padStart(2, '0')}`,
          description: `Transaction ${i}`,
        });
      }

      const summary = await service.getSummary();

      expect(summary.recentTransactions).toHaveLength(5);
      // findAll returns desc by date, so most recent first
      expect(summary.recentTransactions[0].description).toBe('Transaction 8');
    });

    it('should include category names when a category is assigned', async () => {
      const foodId = await seedCategory('Food', 'expense');

      await seedTransaction({
        categoryId: foodId,
        description: 'With category',
      });
      await seedTransaction({
        description: 'No category',
      });

      const summary = await service.getSummary();
      const withCat = summary.recentTransactions.find(
        (t) => t.description === 'With category',
      );
      const noCat = summary.recentTransactions.find(
        (t) => t.description === 'No category',
      );

      expect(withCat.categoryName).toBe('Food');
      expect(noCat.categoryName).toBeNull();
    });

    it('should return fewer than 5 when fewer transactions exist', async () => {
      await seedTransaction();
      await seedTransaction();

      const summary = await service.getSummary();

      expect(summary.recentTransactions).toHaveLength(2);
    });
  });

  // ─── Filters ─────────────────────────────────────────────────

  describe('filters', () => {
    it('should respect date range filters in aggregation', async () => {
      await seedTransaction({
        type: 'expense',
        amount: 100,
        date: '2026-01-15',
      });
      await seedTransaction({
        type: 'expense',
        amount: 200,
        date: '2026-02-15',
      });
      await seedTransaction({
        type: 'expense',
        amount: 300,
        date: '2026-03-15',
      });

      const summary = await service.getSummary({
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(summary.totals.expense).toBe(200);
      expect(summary.monthlyEvolution).toHaveLength(1);
      expect(summary.monthlyEvolution[0].month).toBe('2026-02');
    });

    it('should respect type filter in aggregation', async () => {
      await seedTransaction({ type: 'expense', amount: 100 });
      await seedTransaction({ type: 'income', amount: 500 });

      const summary = await service.getSummary({ type: 'expense' });

      expect(summary.totals.expense).toBe(100);
      expect(summary.totals.income).toBe(0);
    });
  });
});
