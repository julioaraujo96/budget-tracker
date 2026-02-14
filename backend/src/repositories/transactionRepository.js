import { db as defaultDb } from '../config/database.js';
import { transactions, categories } from '../db/schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

/**
 * Creates a transaction repository bound to the given database instance.
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db - Drizzle database instance
 * @returns {object} Transaction repository with CRUD and recurring group operations
 */
export function createTransactionRepository(db) {
  return {
    /**
     * Retrieves transactions with optional filters, ordered by date descending.
     * @param {object} [filters={}] - Optional filter criteria
     * @param {string} [filters.type] - Transaction type ('expense', 'income', 'investment')
     * @param {number} [filters.categoryId] - Category ID to filter by
     * @param {string} [filters.startDate] - Start date (YYYY-MM-DD), inclusive
     * @param {string} [filters.endDate] - End date (YYYY-MM-DD), inclusive
     * @returns {Promise<Array>} Filtered list of transactions
     */
    async findAll(filters = {}) {
      const conditions = [];

      if (filters.type) {
        conditions.push(eq(transactions.type, filters.type));
      }
      if (filters.categoryId) {
        conditions.push(eq(transactions.categoryId, filters.categoryId));
      }
      if (filters.startDate) {
        conditions.push(gte(transactions.date, filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(lte(transactions.date, filters.endDate));
      }

      let query = db.select().from(transactions);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return query.orderBy(desc(transactions.date));
    },

    /**
     * Finds a single transaction by its ID.
     * @param {number} id - Transaction ID
     * @returns {Promise<object|undefined>} The transaction or undefined if not found
     */
    async findById(id) {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id));
      return transaction;
    },

    /**
     * Creates a new transaction.
     * @param {object} data - Transaction data
     * @returns {Promise<object>} The created transaction
     */
    async create(data) {
      const [transaction] = await db
        .insert(transactions)
        .values(data)
        .returning();
      return transaction;
    },

    /**
     * Updates an existing transaction by ID.
     * @param {number} id - Transaction ID
     * @param {object} data - Fields to update
     * @returns {Promise<object|undefined>} The updated transaction or undefined if not found
     */
    async update(id, data) {
      const [transaction] = await db
        .update(transactions)
        .set(data)
        .where(eq(transactions.id, id))
        .returning();
      return transaction;
    },

    /**
     * Deletes a transaction by ID.
     * @param {number} id - Transaction ID
     * @returns {Promise<void>}
     */
    async delete(id) {
      return db.delete(transactions).where(eq(transactions.id, id));
    },

    // --- Recurring group operations ---

    /**
     * Finds all transactions belonging to a recurring group.
     * @param {number} groupId - Recurring group ID
     * @returns {Promise<Array>} Transactions in the group, ordered by date ascending
     */
    async findByGroupId(groupId) {
      return db
        .select()
        .from(transactions)
        .where(eq(transactions.recurringGroupId, groupId))
        .orderBy(transactions.date);
    },

    /**
     * Deletes all transactions in a recurring group that are on or after a given date.
     * Used to cancel a subscription from a specific date forward.
     * @param {number} groupId - Recurring group ID
     * @param {string} [fromDate] - Delete from this date onward (YYYY-MM-DD). If omitted, deletes all in group.
     * @returns {Promise<void>}
     */
    async deleteByGroupId(groupId, fromDate) {
      const conditions = [eq(transactions.recurringGroupId, groupId)];

      if (fromDate) {
        conditions.push(gte(transactions.date, fromDate));
      }

      return db.delete(transactions).where(and(...conditions));
    },

    /**
     * Updates all future transactions in a recurring group (on or after a given date).
     * Used to modify a subscription going forward.
     * @param {number} groupId - Recurring group ID
     * @param {string} fromDate - Update from this date onward (YYYY-MM-DD)
     * @param {object} data - Fields to update
     * @returns {Promise<Array>} The updated transactions
     */
    async updateFutureByGroupId(groupId, fromDate, data) {
      return db
        .update(transactions)
        .set(data)
        .where(
          and(
            eq(transactions.recurringGroupId, groupId),
            gte(transactions.date, fromDate),
          ),
        )
        .returning();
    },

    /**
     * Checks if any transactions reference a given category.
     * Useful for preventing deletion of categories in use.
     * @param {number} categoryId - Category ID to check
     * @returns {Promise<boolean>} True if at least one transaction uses this category
     */
    async existsByCategoryId(categoryId) {
      const [result] = await db
        .select({ id: transactions.id })
        .from(transactions)
        .where(eq(transactions.categoryId, categoryId))
        .limit(1);
      return !!result;
    },
  };
}

/** Default transaction repository using the application database */
export const transactionRepository = createTransactionRepository(defaultDb);
