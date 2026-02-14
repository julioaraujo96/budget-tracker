import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from '../db/schema.js';
import { config } from './index.js';

const sqlite = new Database(config.databasePath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Resolve migrations folder relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, '../db/migrations');

/**
 * Applies pending Drizzle migrations to the SQLite database.
 * This is synchronous for better-sqlite3 and safe to call on every startup.
 */
export function runMigrations() {
  migrate(db, { migrationsFolder });
  console.log('Database migrations applied successfully.');
}
