import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['expense', 'income', 'investment'] }).notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['expense', 'income', 'investment'] }).notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  date: text('date').notNull(), // ISO 8601 format: YYYY-MM-DD
  categoryId: integer('category_id').references(() => categories.id),
  recurringGroupId: integer('recurring_group_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
