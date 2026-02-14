import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema.js';
import { config } from './index.js';

const sqlite = new Database(config.databasePath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
