import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/budget.db';

// Ensure the parent directory for the SQLite file exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbPath,
  },
};
