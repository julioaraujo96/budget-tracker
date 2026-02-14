import request from 'supertest';
import { createTestApp } from '../helpers/testApp.js';

describe('Transaction routes', () => {
  let app, sqlite;

  beforeEach(() => {
    ({ app, sqlite } = createTestApp());
  });

  afterEach(() => {
    sqlite.close();
  });

  // Helper: seed a category and return its id
  async function seedCategory(overrides = {}) {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Food', type: 'expense', ...overrides });
    return res.body;
  }

  // ── POST /api/transactions ───────────────────────────────────

  describe('POST /api/transactions', () => {
    it('creates a transaction and returns 201', async () => {
      const res = await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 42.5,
        description: 'Groceries',
        date: '2026-02-10',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        type: 'expense',
        amount: 42.5,
        description: 'Groceries',
        date: '2026-02-10',
      });
      expect(res.body.id).toBeDefined();
    });

    it('creates a transaction with a category', async () => {
      const cat = await seedCategory();

      const res = await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 15,
        date: '2026-03-01',
        categoryId: cat.id,
      });

      expect(res.status).toBe(201);
      expect(res.body.categoryId).toBe(cat.id);
    });

    it('returns 400 when amount is missing', async () => {
      const res = await request(app).post('/api/transactions').send({
        type: 'expense',
        date: '2026-01-01',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 when date format is invalid', async () => {
      const res = await request(app).post('/api/transactions').send({
        type: 'income',
        amount: 100,
        date: '02/14/2026',
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when referenced category does not exist', async () => {
      const res = await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
        categoryId: 999,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Category not found');
    });
  });

  // ── GET /api/transactions ────────────────────────────────────

  describe('GET /api/transactions', () => {
    it('returns an empty array when no transactions exist', async () => {
      const res = await request(app).get('/api/transactions');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns transactions ordered by date descending', async () => {
      await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
      });
      await request(app).post('/api/transactions').send({
        type: 'income',
        amount: 20,
        date: '2026-06-15',
      });

      const res = await request(app).get('/api/transactions');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].date).toBe('2026-06-15');
      expect(res.body[1].date).toBe('2026-01-01');
    });

    it('filters by type', async () => {
      await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
      });
      await request(app).post('/api/transactions').send({
        type: 'income',
        amount: 20,
        date: '2026-01-02',
      });

      const res = await request(app).get('/api/transactions?type=income');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].type).toBe('income');
    });

    it('filters by date range', async () => {
      await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-15',
      });
      await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 20,
        date: '2026-03-15',
      });

      const res = await request(app).get(
        '/api/transactions?startDate=2026-02-01&endDate=2026-04-01',
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].date).toBe('2026-03-15');
    });
  });

  // ── GET /api/transactions/:id ────────────────────────────────

  describe('GET /api/transactions/:id', () => {
    it('returns a single transaction', async () => {
      const created = await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 25,
        date: '2026-01-01',
      });

      const res = await request(app).get(
        `/api/transactions/${created.body.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
      expect(res.body.amount).toBe(25);
    });

    it('returns 404 for non-existent transaction', async () => {
      const res = await request(app).get('/api/transactions/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });
  });

  // ── PUT /api/transactions/:id ────────────────────────────────

  describe('PUT /api/transactions/:id', () => {
    it('updates a transaction', async () => {
      const created = await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
      });

      const res = await request(app)
        .put(`/api/transactions/${created.body.id}`)
        .send({
          type: 'income',
          amount: 999,
          date: '2026-06-01',
          description: 'Updated',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        type: 'income',
        amount: 999,
        date: '2026-06-01',
        description: 'Updated',
      });
    });

    it('returns 404 for non-existent transaction', async () => {
      const res = await request(app).put('/api/transactions/999').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
      });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/transactions/:id ─────────────────────────────

  describe('DELETE /api/transactions/:id', () => {
    it('deletes a transaction and returns 204', async () => {
      const created = await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 10,
        date: '2026-01-01',
      });

      const res = await request(app).delete(
        `/api/transactions/${created.body.id}`,
      );

      expect(res.status).toBe(204);

      // Verify it is gone
      const list = await request(app).get('/api/transactions');
      expect(list.body).toHaveLength(0);
    });

    it('returns 404 for non-existent transaction', async () => {
      const res = await request(app).delete('/api/transactions/999');

      expect(res.status).toBe(404);
    });
  });

  // ── POST /api/transactions/recurring ─────────────────────────

  describe('POST /api/transactions/recurring', () => {
    it('creates 12 monthly recurring occurrences', async () => {
      const res = await request(app)
        .post('/api/transactions/recurring')
        .send({
          type: 'expense',
          amount: 9.99,
          description: 'Streaming',
          date: '2026-01-01',
          frequency: 'monthly',
        });

      expect(res.status).toBe(201);
      expect(res.body.groupId).toBeDefined();
      expect(res.body.transactions).toHaveLength(12);
      // First occurrence matches the start date
      expect(res.body.transactions[0].date).toBe('2026-01-01');
      // All share the same group ID
      const groupIds = new Set(
        res.body.transactions.map((t) => t.recurringGroupId),
      );
      expect(groupIds.size).toBe(1);
    });

    it('returns 400 when frequency is missing', async () => {
      const res = await request(app)
        .post('/api/transactions/recurring')
        .send({
          type: 'expense',
          amount: 5,
          date: '2026-01-01',
        });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/transactions/recurring ──────────────────────────

  describe('GET /api/transactions/recurring', () => {
    it('returns recurring groups', async () => {
      await request(app).post('/api/transactions/recurring').send({
        type: 'expense',
        amount: 12,
        description: 'Gym',
        date: '2026-02-01',
        frequency: 'monthly',
      });

      const res = await request(app).get('/api/transactions/recurring');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        count: 12,
        type: 'expense',
        amount: 12,
        description: 'Gym',
      });
    });
  });

  // ── DELETE /api/transactions/recurring/:groupId ──────────────

  describe('DELETE /api/transactions/recurring/:groupId', () => {
    it('deletes all occurrences in a group', async () => {
      const created = await request(app)
        .post('/api/transactions/recurring')
        .send({
          type: 'expense',
          amount: 10,
          date: '2026-01-01',
          frequency: 'monthly',
        });
      const groupId = created.body.groupId;

      const res = await request(app).delete(
        `/api/transactions/recurring/${groupId}`,
      );

      expect(res.status).toBe(204);

      // Verify all occurrences removed
      const list = await request(app).get('/api/transactions');
      expect(list.body).toHaveLength(0);
    });

    it('deletes only future occurrences when fromDate is specified', async () => {
      const created = await request(app)
        .post('/api/transactions/recurring')
        .send({
          type: 'expense',
          amount: 10,
          date: '2026-01-01',
          frequency: 'monthly',
        });
      const groupId = created.body.groupId;

      // Delete from July onward (should keep Jan–Jun = 6 occurrences)
      const res = await request(app).delete(
        `/api/transactions/recurring/${groupId}?fromDate=2026-07-01`,
      );

      expect(res.status).toBe(204);

      const list = await request(app).get('/api/transactions');
      expect(list.body).toHaveLength(6);
    });

    it('returns 404 for non-existent group', async () => {
      const res = await request(app).delete(
        '/api/transactions/recurring/999999',
      );

      expect(res.status).toBe(404);
    });
  });

  // ── PATCH /api/transactions/recurring/:groupId ───────────────

  describe('PATCH /api/transactions/recurring/:groupId', () => {
    it('updates future occurrences', async () => {
      const created = await request(app)
        .post('/api/transactions/recurring')
        .send({
          type: 'expense',
          amount: 10,
          description: 'Old',
          date: '2026-01-01',
          frequency: 'monthly',
        });
      const groupId = created.body.groupId;

      const res = await request(app)
        .patch(`/api/transactions/recurring/${groupId}`)
        .send({ fromDate: '2026-07-01', amount: 20, description: 'New' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Updated occurrences should have new values
      for (const tx of res.body) {
        expect(tx.amount).toBe(20);
        expect(tx.description).toBe('New');
      }
    });

    it('returns 400 when fromDate is missing', async () => {
      const res = await request(app)
        .patch('/api/transactions/recurring/1')
        .send({ amount: 20 });

      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent group', async () => {
      const res = await request(app)
        .patch('/api/transactions/recurring/999999')
        .send({ fromDate: '2026-07-01', amount: 20 });

      expect(res.status).toBe(404);
    });
  });
});
