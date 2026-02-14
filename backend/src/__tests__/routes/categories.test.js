import request from 'supertest';
import { createTestApp } from '../helpers/testApp.js';

describe('Category routes', () => {
  let app, sqlite;

  beforeEach(() => {
    ({ app, sqlite } = createTestApp());
  });

  afterEach(() => {
    sqlite.close();
  });

  // ── GET /api/categories ──────────────────────────────────────

  describe('GET /api/categories', () => {
    it('returns an empty array when no categories exist', async () => {
      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all categories ordered by name', async () => {
      // Seed two categories
      await request(app)
        .post('/api/categories')
        .send({ name: 'Zebra', type: 'expense' });
      await request(app)
        .post('/api/categories')
        .send({ name: 'Apple', type: 'income' });

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Apple');
      expect(res.body[1].name).toBe('Zebra');
    });
  });

  // ── POST /api/categories ─────────────────────────────────────

  describe('POST /api/categories', () => {
    it('creates a category and returns 201', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Food', type: 'expense' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Food', type: 'expense' });
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ type: 'expense' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 when type is invalid', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Bad', type: 'savings' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  // ── PUT /api/categories/:id ──────────────────────────────────

  describe('PUT /api/categories/:id', () => {
    it('updates a category', async () => {
      const created = await request(app)
        .post('/api/categories')
        .send({ name: 'Old Name', type: 'expense' });

      const res = await request(app)
        .put(`/api/categories/${created.body.id}`)
        .send({ name: 'New Name', type: 'income' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'New Name', type: 'income' });
    });

    it('returns 404 for non-existent category', async () => {
      const res = await request(app)
        .put('/api/categories/999')
        .send({ name: 'X', type: 'expense' });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    it('returns 400 for invalid body', async () => {
      const created = await request(app)
        .post('/api/categories')
        .send({ name: 'Valid', type: 'expense' });

      const res = await request(app)
        .put(`/api/categories/${created.body.id}`)
        .send({ name: '' }); // empty name + missing type

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/categories/:id ───────────────────────────────

  describe('DELETE /api/categories/:id', () => {
    it('deletes a category and returns 204', async () => {
      const created = await request(app)
        .post('/api/categories')
        .send({ name: 'ToDelete', type: 'expense' });

      const res = await request(app).delete(
        `/api/categories/${created.body.id}`,
      );

      expect(res.status).toBe(204);

      // Verify it is gone
      const list = await request(app).get('/api/categories');
      expect(list.body).toHaveLength(0);
    });

    it('returns 404 for non-existent category', async () => {
      const res = await request(app).delete('/api/categories/999');

      expect(res.status).toBe(404);
    });

    it('returns 400 when category has associated transactions', async () => {
      // Create category
      const cat = await request(app)
        .post('/api/categories')
        .send({ name: 'InUse', type: 'expense' });

      // Create transaction referencing the category
      await request(app).post('/api/transactions').send({
        type: 'expense',
        amount: 50,
        date: '2026-01-15',
        categoryId: cat.body.id,
      });

      // Attempt to delete — should fail
      const res = await request(app).delete(
        `/api/categories/${cat.body.id}`,
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('associated transactions');
    });
  });
});
