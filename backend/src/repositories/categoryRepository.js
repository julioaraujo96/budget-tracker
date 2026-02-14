import { db as defaultDb } from '../config/database.js';
import { categories } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Creates a category repository bound to the given database instance.
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db - Drizzle database instance
 * @returns {object} Category repository with CRUD operations
 */
export function createCategoryRepository(db) {
  return {
    /**
     * Retrieves all categories ordered by name.
     * @returns {Promise<Array>} List of all categories
     */
    async findAll() {
      return db.select().from(categories).orderBy(categories.name);
    },

    /**
     * Finds a single category by its ID.
     * @param {number} id - Category ID
     * @returns {Promise<object|undefined>} The category or undefined if not found
     */
    async findById(id) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id));
      return category;
    },

    /**
     * Creates a new category.
     * @param {object} data - Category data ({ name, type })
     * @returns {Promise<object>} The created category
     */
    async create(data) {
      const [category] = await db
        .insert(categories)
        .values(data)
        .returning();
      return category;
    },

    /**
     * Updates an existing category by ID.
     * @param {number} id - Category ID
     * @param {object} data - Fields to update ({ name?, type? })
     * @returns {Promise<object|undefined>} The updated category or undefined if not found
     */
    async update(id, data) {
      const [category] = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      return category;
    },

    /**
     * Deletes a category by ID.
     * @param {number} id - Category ID
     * @returns {Promise<void>}
     */
    async delete(id) {
      return db.delete(categories).where(eq(categories.id, id));
    },
  };
}

/** Default category repository using the application database */
export const categoryRepository = createCategoryRepository(defaultDb);
