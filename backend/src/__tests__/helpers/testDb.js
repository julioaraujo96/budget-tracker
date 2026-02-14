import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../db/schema.js';

/**
 * Creates an in-memory SQLite database with the full schema applied.
 * Used by tests to avoid polluting the development database.
 *
 * @returns {{ db: import('drizzle-orm/better-sqlite3').BetterSQLite3Database, sqlite: import('better-sqlite3').Database }}
 */
export function createTestDb() {
  const sqlite = new Database(':memory:');

  // Create tables matching the migration
  sqlite.exec(`
    CREATE TABLE categories (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      type text NOT NULL
    );

    CREATE TABLE transactions (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      type text NOT NULL,
      amount real NOT NULL,
      description text,
      date text NOT NULL,
      category_id integer,
      recurring_group_id integer,
      created_at text DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE no action
    );
  `);

  const db = drizzle(sqlite, { schema });

  return { db, sqlite };
}
