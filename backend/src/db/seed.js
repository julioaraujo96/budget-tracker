import { db } from '../config/database.js';
import { categories } from './schema.js';

/**
 * Default categories to seed the database with.
 * Covers common expense, income, and investment types.
 */
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
 * Seeds the database with default categories.
 * Skips seeding if categories already exist.
 */
async function seed() {
  console.log('Checking existing categories...');

  const existing = await db.select().from(categories);

  if (existing.length > 0) {
    console.log(`Database already has ${existing.length} categories. Skipping seed.`);
    return;
  }

  console.log('Seeding default categories...');

  for (const category of defaultCategories) {
    await db.insert(categories).values(category);
  }

  console.log(`Seeded ${defaultCategories.length} default categories.`);
}

seed()
  .then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
