import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { db, runMigrations } from './config/database.js';
import { categories } from './db/schema.js';
import { categoryService } from './services/categoryService.js';
import { transactionService } from './services/transactionService.js';
import { dashboardService } from './services/dashboardService.js';
import { createApiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Default categories for initial seed ──────────────────────────

const defaultCategories = [
  // Expense categories
  { name: 'Food', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Housing', type: 'expense' },
  { name: 'Leisure', type: 'expense' },
  { name: 'Health', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Subscriptions', type: 'expense' },
  { name: 'Other Expenses', type: 'expense' },

  // Income categories
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Other Income', type: 'income' },

  // Investment categories
  { name: 'Stocks', type: 'investment' },
  { name: 'ETFs', type: 'investment' },
  { name: 'Crypto', type: 'investment' },
  { name: 'Other Investments', type: 'investment' },
];

/**
 * Seeds the database with default categories if it is empty.
 */
async function seedDatabase() {
  const existing = await db.select().from(categories);
  if (existing.length > 0) return;

  for (const category of defaultCategories) {
    await db.insert(categories).values(category);
  }
  console.log(`Seeded ${defaultCategories.length} default categories.`);
}

// ── Express application ──────────────────────────────────────────

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// API routes
app.use(
  '/api',
  createApiRouter({
    categoryService,
    transactionService,
    dashboardService,
  }),
);

// Global error handler (must be registered after routes)
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────

// Apply pending migrations, seed defaults, then start the server
try {
  runMigrations();
} catch (error) {
  console.error('Failed to run migrations:', error);
  process.exit(1);
}

seedDatabase()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Budget Tracker API running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

export default app;
