# This file is intended to be loaded by AI coding assistants (e.g. Copilot, ChatGPT, Claude)
# to guide code generation and review consistency for the Budget Tracker application.
# ai_guidelines: true
# language: javascript, typescript
# architecture: react, nodejs, express, sqlite, drizzle-orm

# Budget Tracker — AI Copilot Guidelines

High-level coding standards and best practices for building a personal finance management application with React, Node.js, Express, SQLite, and Drizzle ORM. These guidelines ensure consistency in architecture patterns, code quality, and development practices across frontend and backend components.

---

# Role & Objective

You are an Expert Senior Software Engineer specializing in full-stack JavaScript development.

**Context:** Building a personal budget tracking web application that:

- **Transaction Management** — Users can create, edit, and delete financial transactions (expenses, income, investments)
- **Recurring Transactions** — Support for subscriptions and periodic transactions with automatic generation of occurrences
- **Category Management** — Customizable categories associated with transaction types
- **Dashboard Analytics** — Visual summary with charts showing financial health (pie charts, bar charts, balance overview)
- **RESTful API** — Express backend provides endpoints for CRUD operations and aggregated dashboard data

**Core Components**:
- React frontend (component-based UI with shadcn/ui)
- Node.js + Express backend (REST API)
- SQLite database (local file, single-user)
- Drizzle ORM (type-safe database access)
- Recharts (data visualization)
- Docker + Docker Compose (containerization)

## JavaScript/Node.js Version & Tech Stack

**Node.js Version**: Node.js 20 LTS (or latest LTS)

**Backend Technologies**:
- **Web Framework**: Express.js — minimal, flexible Node.js web framework
- **Database**: SQLite — file-based, zero-configuration database ideal for single-user applications
- **ORM**: Drizzle ORM — lightweight, type-safe ORM with SQL-like syntax
- **Validation**: Zod — TypeScript-first schema validation
- **Environment**: dotenv — environment variable management

**Frontend Technologies**:
- **UI Framework**: React 18+ — component-based architecture with hooks
- **UI Components**: shadcn/ui — accessible, customizable component library built on Radix UI
- **Charts**: Recharts — declarative charting library for React
- **HTTP Client**: Fetch API or Axios — REST API communication
- **Styling**: Tailwind CSS — utility-first CSS framework
- **Build Tool**: Vite — fast development server and build tool

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  React + shadcn/ui + Recharts                                   │ │
│  │  - Dashboard with financial summary                             │ │
│  │  - Transaction list with filters                                │ │
│  │  - Forms for creating/editing transactions                      │ │
│  │  - Category management                                          │ │
│  │  - Pie charts (expenses by category)                            │ │
│  │  - Bar/Line charts (monthly evolution)                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTP/REST API
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND (Port 3001)                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ REST API Endpoints:                                           │  │
│  │  • GET/POST        /api/transactions       - List/Create      │  │
│  │  • GET/PUT/DELETE  /api/transactions/:id   - Read/Update/Del  │  │
│  │  • POST            /api/transactions/recurring - Create recur │  │
│  │  • GET/POST        /api/categories         - List/Create      │  │
│  │  • PUT/DELETE      /api/categories/:id     - Update/Delete    │  │
│  │  • GET             /api/dashboard          - Aggregated data  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    LAYERED ARCHITECTURE                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │   Routes    │→ │  Services   │→ │    Repositories     │  │  │
│  │  │(Controllers)│  │  (Business  │  │   (Data Access)     │  │  │
│  │  │             │  │   Logic)    │  │                     │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │  │
│  └───────────────────────────────────────────────┼──────────────┘  │
└──────────────────────────────────────────────────┼──────────────────┘
                                                   │
                                                   ↓
                                            ┌──────────────┐
                                            │    SQLite    │
                                            │  (File DB)   │
                                            │ budget.db    │
                                            └──────────────┘
```

### Layered Architecture Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│                    (React Frontend)                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Components: Dashboard, TransactionList, TransactionForm  │  │
│  │  State Management: React hooks (useState, useEffect)      │  │
│  │  HTTP Client: fetch/axios for API calls                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Routes)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  - Receives HTTP requests                                  │  │
│  │  - Validates input parameters (Zod schemas)               │  │
│  │  - Calls appropriate service methods                       │  │
│  │  - Returns HTTP responses with proper status codes         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Business Logic)                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  - Contains business rules and validation                  │  │
│  │  - Calculates totals, balances, aggregations              │  │
│  │  - Generates recurring transaction occurrences             │  │
│  │  - Independent of Express and database details             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER (Data Access)                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  - All database operations (CRUD)                          │  │
│  │  - Uses Drizzle ORM for queries                            │  │
│  │  - Abstracts persistence details                           │  │
│  │  - Returns domain objects, not raw DB results              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (SQLite)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Tables: categories, transactions                          │  │
│  │  Drizzle schema definitions                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Module Structure

```
budget-tracker/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── index.js              # Express app entry point
│   │   ├── config/
│   │   │   └── database.js       # Drizzle DB connection
│   │   ├── db/
│   │   │   ├── schema.js         # Drizzle table definitions
│   │   │   └── migrations/       # Database migrations
│   │   ├── routes/
│   │   │   ├── index.js          # Route aggregator
│   │   │   ├── transactions.js   # Transaction endpoints
│   │   │   ├── categories.js     # Category endpoints
│   │   │   └── dashboard.js      # Dashboard endpoint
│   │   ├── services/
│   │   │   ├── transactionService.js
│   │   │   ├── categoryService.js
│   │   │   └── dashboardService.js
│   │   ├── repositories/
│   │   │   ├── transactionRepository.js
│   │   │   └── categoryRepository.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Global error handling
│   │   │   └── validation.js     # Request validation
│   │   └── utils/
│   │       └── dateUtils.js      # Date helper functions
│   ├── package.json
│   ├── .env                      # Environment variables
│   └── Dockerfile
├── frontend/                     # React application
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main app component
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── CategoryManager.jsx
│   │   │   └── Charts/
│   │   │       ├── ExpensesPieChart.jsx
│   │   │       └── MonthlyBarChart.jsx
│   │   ├── hooks/
│   │   │   ├── useTransactions.js
│   │   │   └── useCategories.js
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   └── utils/
│   │       └── formatters.js     # Currency, date formatters
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml            # Multi-service orchestration
├── README.md                     # Setup and usage instructions
└── CLAUDE.md                     # This file
```

---

## Database Design

### Schema Overview

The database uses a **two-table relational structure** for categories and transactions:

```
┌─────────────────────────────────────────────────┐
│                  categories                      │
├─────────────────────────────────────────────────┤
│ PK  id           INTEGER AUTOINCREMENT          │
│     name         TEXT NOT NULL                  │
│     type         TEXT NOT NULL                  │ ── 'expense' | 'income' | 'investment'
└──────────────┬──────────────────────────────────┘
               │ 1:N (category_id FK)
               ↓
┌─────────────────────────────────────────────────┐
│                 transactions                     │
├─────────────────────────────────────────────────┤
│ PK  id                  INTEGER AUTOINCREMENT   │
│     type                TEXT NOT NULL           │ ── 'expense' | 'income' | 'investment'
│     amount              REAL NOT NULL           │
│     description         TEXT                    │
│     date                TEXT NOT NULL           │ ── ISO 8601 format
│ FK  category_id         INTEGER                 │ → categories.id
│     recurring_group_id  INTEGER                 │ ── Groups recurring transactions
│     created_at          TEXT DEFAULT NOW        │
└─────────────────────────────────────────────────┘
```

### Drizzle Schema Definition

```javascript
// backend/src/db/schema.js
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
```

---

## API Endpoints

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (with optional filters: type, category, startDate, endDate) |
| GET | `/api/transactions/:id` | Get single transaction by ID |
| POST | `/api/transactions` | Create new transaction |
| PUT | `/api/transactions/:id` | Update existing transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| POST | `/api/transactions/recurring` | Create recurring transaction (generates 12 months of occurrences) |
| GET | `/api/transactions/recurring` | List active recurring groups |
| DELETE | `/api/transactions/recurring/:groupId` | Cancel subscription (delete future occurrences) |
| PATCH | `/api/transactions/recurring/:groupId` | Update future occurrences |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated data: totals by type, balance, category distribution |

---

## Coding Standards

### JavaScript/TypeScript Best Practices

**Use ES6+ features consistently**:
```javascript
// ✅ Good: Arrow functions, destructuring, template literals
const formatTransaction = ({ amount, type, description }) => {
  return `${type}: ${description} - €${amount.toFixed(2)}`;
};

// ✅ Good: Async/await over promises
const getTransactions = async (filters) => {
  const transactions = await transactionRepository.findAll(filters);
  return transactions;
};

// ❌ Bad: var, string concatenation, callbacks
var formatTransaction = function(transaction) {
  return transaction.type + ': ' + transaction.description;
};
```

**Use const by default, let when reassignment is needed**:
```javascript
// ✅ Good
const BASE_URL = '/api';
let currentPage = 1;

// ❌ Bad: Using let when const would work
let API_URL = '/api/transactions'; // Never reassigned
```

**Use meaningful variable and function names**:
```javascript
// ✅ Good: Descriptive names
const calculateMonthlyBalance = (transactions) => { /* ... */ };
const isExpense = (transaction) => transaction.type === 'expense';

// ❌ Bad: Cryptic names
const calc = (t) => { /* ... */ };
const chk = (t) => t.type === 'expense';
```

### Express Backend Patterns

**Route handler structure**:
```javascript
// routes/transactions.js
import express from 'express';
import { transactionService } from '../services/transactionService.js';
import { validateTransaction } from '../middleware/validation.js';

const router = express.Router();

// GET /api/transactions
router.get('/', async (req, res, next) => {
  try {
    const { type, categoryId, startDate, endDate } = req.query;
    const transactions = await transactionService.getAll({ 
      type, 
      categoryId, 
      startDate, 
      endDate 
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions
router.post('/', validateTransaction, async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Service layer pattern**:
```javascript
// services/transactionService.js
import { transactionRepository } from '../repositories/transactionRepository.js';

export const transactionService = {
  async getAll(filters) {
    return transactionRepository.findAll(filters);
  },

  async create(data) {
    // Business logic: validate, transform, etc.
    const transaction = {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
    };
    return transactionRepository.create(transaction);
  },

  async createRecurring(data) {
    const { frequency, ...transactionData } = data;
    const occurrences = this.generateOccurrences(transactionData, frequency, 12);
    const groupId = Date.now(); // Simple unique ID for the group
    
    return Promise.all(
      occurrences.map(occurrence => 
        transactionRepository.create({ ...occurrence, recurringGroupId: groupId })
      )
    );
  },

  generateOccurrences(baseTransaction, frequency, months) {
    const occurrences = [];
    const startDate = new Date(baseTransaction.date);
    
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      if (frequency === 'monthly') date.setMonth(date.getMonth() + i);
      if (frequency === 'weekly') date.setDate(date.getDate() + (i * 7));
      if (frequency === 'annual') date.setFullYear(date.getFullYear() + i);
      
      occurrences.push({
        ...baseTransaction,
        date: date.toISOString().split('T')[0],
      });
    }
    return occurrences;
  },
};
```

**Repository layer pattern**:
```javascript
// repositories/transactionRepository.js
import { db } from '../config/database.js';
import { transactions, categories } from '../db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

export const transactionRepository = {
  async findAll(filters = {}) {
    let query = db.select().from(transactions);
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

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(transactions.date);
  },

  async findById(id) {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  },

  async create(data) {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();
    return transaction;
  },

  async update(id, data) {
    const [transaction] = await db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  },

  async delete(id) {
    return db.delete(transactions).where(eq(transactions.id, id));
  },
};
```

### React Frontend Patterns

**Component structure**:
```jsx
// components/TransactionList.jsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '../services/api';

export function TransactionList({ filters, onEdit }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.getTransactions(filters);
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction}
            onEdit={onEdit}
          />
        ))}
      </CardContent>
    </Card>
  );
}
```

**Custom hooks for data fetching**:
```javascript
// hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useTransactions(initialFilters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (data) => {
    const newTransaction = await api.createTransaction(data);
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  };

  const updateTransaction = async (id, data) => {
    const updated = await api.updateTransaction(id, data);
    setTransactions(prev => 
      prev.map(t => t.id === id ? updated : t)
    );
    return updated;
  };

  const deleteTransaction = async (id) => {
    await api.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
```

**API client**:
```javascript
// services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/transactions${params ? `?${params}` : ''}`);
  },
  getTransaction: (id) => request(`/transactions/${id}`),
  createTransaction: (data) => request('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTransaction: (id, data) => request(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTransaction: (id) => request(`/transactions/${id}`, {
    method: 'DELETE',
  }),
  createRecurringTransaction: (data) => request('/transactions/recurring', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCategory: (id, data) => request(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCategory: (id) => request(`/categories/${id}`, {
    method: 'DELETE',
  }),

  // Dashboard
  getDashboard: () => request('/dashboard'),
};
```

---

## Validation

### Using Zod for Request Validation

```javascript
// middleware/validation.js
import { z } from 'zod';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'investment']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  categoryId: z.number().int().positive().optional(),
});

const recurringTransactionSchema = transactionSchema.extend({
  frequency: z.enum(['weekly', 'monthly', 'annual']),
});

export const validateTransaction = (req, res, next) => {
  try {
    req.body = transactionSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};

export const validateRecurringTransaction = (req, res, next) => {
  try {
    req.body = recurringTransactionSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
```

---

## Error Handling

### Backend Error Handler

```javascript
// middleware/errorHandler.js

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unexpected errors
  res.status(500).json({
    error: 'Internal server error',
  });
};
```

### Frontend Error Handling

```jsx
// components/ErrorBoundary.jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Configuration Management

### Backend Configuration

```javascript
// config/database.js
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema.js';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/budget.db';

const sqlite = new Database(DATABASE_PATH);
export const db = drizzle(sqlite, { schema });
```

```javascript
// config/index.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: process.env.DATABASE_PATH || './data/budget.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
```

### Environment Variables (.env)

```bash
# Backend
PORT=3001
DATABASE_PATH=./data/budget.db
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# Frontend (Vite uses VITE_ prefix)
VITE_API_URL=http://localhost:3001/api
```

---

## Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - PORT=3001
      - DATABASE_PATH=/app/data/budget.db
      - CORS_ORIGIN=http://localhost:5173
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Backend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "src/index.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Code Quality Checklist

### General
- [ ] Use ES6+ features (arrow functions, destructuring, template literals)
- [ ] Use `const` by default, `let` only when reassignment is needed
- [ ] Use meaningful variable and function names
- [ ] Add JSDoc comments for public functions
- [ ] No hardcoded configuration values (use environment variables)
- [ ] Consistent code formatting (use Prettier)
- [ ] No console.log in production code (use proper logging)

### Backend (Express + Drizzle)
- [ ] Layered architecture: Routes → Services → Repositories
- [ ] Input validation using Zod schemas
- [ ] Proper error handling with custom error classes
- [ ] Async/await for all database operations
- [ ] Global error handler middleware
- [ ] CORS configured for frontend origin
- [ ] Environment variables via dotenv

### Frontend (React)
- [ ] Functional components with hooks
- [ ] Custom hooks for data fetching logic
- [ ] Proper loading and error states
- [ ] API client abstraction
- [ ] PropTypes or TypeScript for component props
- [ ] Error boundaries for graceful error handling
- [ ] Responsive design with Tailwind CSS

### Database
- [ ] Drizzle schema definitions for all tables
- [ ] Proper foreign key relationships
- [ ] Database migrations for schema changes
- [ ] Repository pattern for data access

---

## Anti-Patterns to Avoid

### 1. Direct Database Access in Routes

**❌ Bad**:
```javascript
router.get('/', async (req, res) => {
  const result = await db.select().from(transactions); // Direct DB access in route!
  res.json(result);
});
```

**✅ Good**:
```javascript
router.get('/', async (req, res, next) => {
  try {
    const result = await transactionService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

### 2. Missing Error Handling

**❌ Bad**:
```javascript
router.post('/', async (req, res) => {
  const transaction = await transactionService.create(req.body); // No try/catch!
  res.json(transaction);
});
```

**✅ Good**:
```javascript
router.post('/', async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});
```

### 3. Mixing Business Logic with Data Access

**❌ Bad**:
```javascript
// In repository - shouldn't have business logic
async create(data) {
  // Business logic in repository!
  if (data.type === 'expense' && data.amount > 1000) {
    console.log('Large expense alert!');
  }
  return db.insert(transactions).values(data);
}
```

**✅ Good**:
```javascript
// Service handles business logic
async create(data) {
  if (data.type === 'expense' && data.amount > 1000) {
    console.log('Large expense alert!');
  }
  return transactionRepository.create(data);
}
```

### 4. Not Using Loading States in React

**❌ Bad**:
```jsx
function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    api.getTransactions().then(setTransactions); // No loading/error handling!
  }, []);
  
  return <div>{transactions.map(/* ... */)}</div>;
}
```

**✅ Good**:
```jsx
function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    api.getTransactions()
      .then(setTransactions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return <div>{transactions.map(/* ... */)}</div>;
}
```

### 5. Hardcoded API URLs

**❌ Bad**:
```javascript
const response = await fetch('http://localhost:3001/api/transactions');
```

**✅ Good**:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL;
const response = await fetch(`${BASE_URL}/transactions`);
```

---

## Summary

### Core Principles

**Architecture**:
- **Layered architecture** — Routes → Services → Repositories for clear separation of concerns
- **Component-based frontend** — React components with shadcn/ui for consistent UI
- **RESTful API** — Express backend with standard HTTP methods and status codes
- **Local persistence** — SQLite for simple, file-based storage ideal for single-user app

**Technical Stack**:
- React + shadcn/ui + Recharts (frontend)
- Node.js + Express (backend API)
- SQLite + Drizzle ORM (database)
- Docker + Docker Compose (containerization)

**Development Priorities**:
- **Code organization** — Clear module structure following layered architecture
- **Input validation** — Zod schemas for request validation
- **Error handling** — Custom error classes and global error handler
- **Type safety** — Drizzle ORM for type-safe database queries
- **Configuration** — Environment variables, no hardcoded values

### Transaction Types

The application supports three transaction types:
- **expense** — Money going out (rent, groceries, subscriptions)
- **income** — Money coming in (salary, freelance work)
- **investment** — Money allocated to investments (stocks, ETFs, crypto)

### Recurring Transactions

The system generates all occurrences for 12 months upfront when creating a recurring transaction. This simplifies implementation and ensures future transactions are immediately available. The `recurring_group_id` field links all occurrences for batch operations (edit/cancel subscription).

When in doubt, follow existing patterns in the codebase or refer to this guide.