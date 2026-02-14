import request from 'supertest';
import { createTestApp } from '../helpers/testApp.js';

describe('Dashboard routes', () => {
  let app, sqlite;

  beforeEach(() => {
    ({ app, sqlite } = createTestApp());
  });

  afterEach(() => {
    sqlite.close();
  });

  // Helper: seed a category
  async function seedCategory(name, type) {
    const res = await request(app)
      .post('/api/categories')
      .send({ name, type });
    return res.body;
  }

  // Helper: seed a transaction
  async function seedTransaction(data) {
    const res = await request(app).post('/api/transactions').send(data);
    return res.body;
  }

  // ── GET /api/dashboard ───────────────────────────────────────

  describe('GET /api/dashboard', () => {
    it('returns zeroed totals when no transactions exist', async () => {
      const res = await request(app).get('/api/dashboard');

      expect(res.status).toBe(200);
      expect(res.body.totals).toEqual({
        income: 0,
        expense: 0,
        investment: 0,
      });
      expect(res.body.balance).toBe(0);
      expect(res.body.categoryBreakdown).toEqual([]);
      expect(res.body.monthlyEvolution).toEqual([]);
      expect(res.body.recentTransactions).toEqual([]);
    });

    it('computes correct totals and balance', async () => {
      await seedTransaction({
        type: 'income',
        amount: 3000,
        date: '2026-01-10',
      });
      await seedTransaction({
        type: 'expense',
        amount: 800,
        date: '2026-01-15',
      });
      await seedTransaction({
        type: 'expense',
        amount: 200,
        date: '2026-01-20',
      });
      await seedTransaction({
        type: 'investment',
        amount: 500,
        date: '2026-01-25',
      });

      const res = await request(app).get('/api/dashboard');

      expect(res.status).toBe(200);
      expect(res.body.totals.income).toBe(3000);
      expect(res.body.totals.expense).toBe(1000);
      expect(res.body.totals.investment).toBe(500);
      // balance = income - expense - investment = 3000 - 1000 - 500
      expect(res.body.balance).toBe(1500);
    });

    it('returns category breakdown for expenses', async () => {
      const food = await seedCategory('Food', 'expense');
      const transport = await seedCategory('Transport', 'expense');

      await seedTransaction({
        type: 'expense',
        amount: 200,
        date: '2026-01-05',
        categoryId: food.id,
      });
      await seedTransaction({
        type: 'expense',
        amount: 100,
        date: '2026-01-10',
        categoryId: transport.id,
      });
      await seedTransaction({
        type: 'expense',
        amount: 50,
        date: '2026-01-15',
        categoryId: food.id,
      });

      const res = await request(app).get('/api/dashboard');

      expect(res.body.categoryBreakdown).toHaveLength(2);
      // Sorted by amount descending
      expect(res.body.categoryBreakdown[0]).toEqual({
        name: 'Food',
        amount: 250,
      });
      expect(res.body.categoryBreakdown[1]).toEqual({
        name: 'Transport',
        amount: 100,
      });
    });

    it('returns monthly evolution sorted ascending', async () => {
      await seedTransaction({
        type: 'income',
        amount: 3000,
        date: '2026-03-01',
      });
      await seedTransaction({
        type: 'expense',
        amount: 500,
        date: '2026-01-15',
      });
      await seedTransaction({
        type: 'expense',
        amount: 700,
        date: '2026-03-20',
      });

      const res = await request(app).get('/api/dashboard');

      expect(res.body.monthlyEvolution).toHaveLength(2);
      expect(res.body.monthlyEvolution[0].month).toBe('2026-01');
      expect(res.body.monthlyEvolution[0].expense).toBe(500);
      expect(res.body.monthlyEvolution[1].month).toBe('2026-03');
      expect(res.body.monthlyEvolution[1].income).toBe(3000);
      expect(res.body.monthlyEvolution[1].expense).toBe(700);
    });

    it('returns up to 5 recent transactions', async () => {
      for (let i = 1; i <= 7; i++) {
        await seedTransaction({
          type: 'expense',
          amount: i * 10,
          date: `2026-01-${String(i).padStart(2, '0')}`,
        });
      }

      const res = await request(app).get('/api/dashboard');

      expect(res.body.recentTransactions).toHaveLength(5);
    });

    it('filters by date range', async () => {
      await seedTransaction({
        type: 'expense',
        amount: 100,
        date: '2026-01-15',
      });
      await seedTransaction({
        type: 'income',
        amount: 500,
        date: '2026-06-15',
      });

      const res = await request(app).get(
        '/api/dashboard?startDate=2026-06-01&endDate=2026-06-30',
      );

      expect(res.status).toBe(200);
      expect(res.body.totals.income).toBe(500);
      expect(res.body.totals.expense).toBe(0);
    });
  });
});
