# Budget Tracker — Tasks

Full task list for the Budget Tracker project implementation.

---

## Phase 0: Planning

- [x] **0.1** Create `tasks.md` at the project root with the full plan and all numbered tasks

---

## Phase 1: Project Setup and Git Initialization

- [x] **1.1** Initialize git repository (`git init`)
- [x] **1.2** Create `.gitignore` (node_modules, .env, data/, dist/, *.db)
- [x] **1.3** Create folder structure (`backend/src/`, `frontend/src/`)
- [x] **1.4** Initialize `backend/package.json` and install dependencies (express, better-sqlite3, drizzle-orm, drizzle-kit, zod, dotenv, cors)
- [x] **1.5** Initialize `frontend/` with Vite + React template
- [x] **1.6** Install frontend dependencies (shadcn/ui, recharts, tailwindcss, lucide-react)
- [x] **1.7** Create `.env` files for backend and frontend, and `README.md` at the root

---

## Phase 2: Database Layer (Schema + Migrations + Connection)

- [x] **2.1** Create centralized config file `backend/src/config/index.js` (port, DB path, CORS origin)
- [x] **2.2** Create Drizzle schema `backend/src/db/schema.js` (categories and transactions tables)
- [x] **2.3** Configure Drizzle connection `backend/src/config/database.js` (better-sqlite3)
- [x] **2.4** Create `backend/drizzle.config.js` for migration configuration
- [x] **2.5** Generate and run initial migration (create tables in SQLite DB)
- [x] **2.6** Create seed script `backend/src/db/seed.js` with default categories (Food, Transport, Leisure, Salary, Freelance, Stocks, ETFs, Crypto, etc.)

---

## Phase 3: Backend — Repository Layer

- [x] **3.1** Create `backend/src/repositories/categoryRepository.js` — full CRUD (findAll, findById, create, update, delete)
- [x] **3.2** Create `backend/src/repositories/transactionRepository.js` — CRUD with filters (type, categoryId, startDate, endDate) + recurring group methods (findByGroupId, deleteByGroupId, updateFutureByGroupId)

---

## Phase 4: Backend — Service Layer (Business Logic)

- [x] **4.1** Create `backend/src/services/categoryService.js` — category business logic (validation, prevent deleting categories with associated transactions)
- [x] **4.2** Create `backend/src/services/transactionService.js` — transaction CRUD + recurring transaction generation (12 occurrences, weekly/monthly/annual frequencies) + cancel/edit future subscriptions
- [x] **4.3** Create `backend/src/services/dashboardService.js` — aggregated data: totals by type, balance, category distribution, monthly evolution

---

## Phase 5: Backend — API Routes, Middleware, and Entry Point

- [x] **5.1** Create `backend/src/middleware/errorHandler.js` — error classes (AppError, NotFoundError, ValidationError) + global error handler middleware
- [x] **5.2** Create `backend/src/middleware/validation.js` — Zod schemas for transaction, recurring transaction, and category
- [x] **5.3** Create `backend/src/utils/dateUtils.js` — date helper functions
- [x] **5.4** Create `backend/src/routes/categories.js` — endpoints GET, POST `/api/categories` and PUT, DELETE `/api/categories/:id`
- [x] **5.5** Create `backend/src/routes/transactions.js` — CRUD endpoints `/api/transactions` + recurring endpoints
- [x] **5.6** Create `backend/src/routes/dashboard.js` — endpoint GET `/api/dashboard`
- [x] **5.7** Create `backend/src/routes/index.js` — route aggregator
- [x] **5.8** Create `backend/src/index.js` — Express entry point (CORS, JSON body parser, routes, error handler, initial seed)

---

## Phase 6: Frontend — Project Setup and Core Components

- [x] **6.1** Configure Vite proxy to backend (port 3001) in `frontend/vite.config.js`
- [x] **6.2** Set up shadcn/ui with Tailwind CSS (`components.json`, `tailwind.config.js`, `globals.css`)
- [x] **6.3** Install shadcn/ui components (Button, Card, Input, Select, Dialog, Table, Badge, Tabs, Label, Separator)
- [x] **6.4** Create API client `frontend/src/services/api.js` (fetch wrapper with error handling)
- [x] **6.5** Create custom hook `frontend/src/hooks/useTransactions.js` (CRUD + loading/error state)
- [x] **6.6** Create custom hook `frontend/src/hooks/useCategories.js`
- [x] **6.7** Create utilities `frontend/src/utils/formatters.js` (EUR currency formatting, date formatting)
- [x] **6.8** Create `frontend/src/App.jsx` with tab-based navigation (Dashboard, Transactions, Categories) and `ErrorBoundary`

---

## Phase 7: Frontend — Feature Components and Charts

- [x] **7.1** Create `Dashboard.jsx` — summary cards (income, expenses, investments, balance) + recent transactions list
- [x] **7.2** Create `Charts/ExpensesPieChart.jsx` — pie chart of expense distribution by category (Recharts)
- [x] **7.3** Create `Charts/MonthlyBarChart.jsx` — bar chart with monthly income vs expenses evolution (Recharts)
- [x] **7.4** Create `TransactionList.jsx` — transaction table with filters (type, category, date range) and edit/delete actions
- [x] **7.5** Create `TransactionForm.jsx` — dialog form for creating/editing transactions (single and recurring), with category selection and frequency picker
- [x] **7.6** Create `CategoryManager.jsx` — category CRUD interface with type association (expense/income/investment)

---

## Phase 8: Docker and Final Polish

- [x] **8.1** Create `backend/Dockerfile` (Node 20 Alpine, production deps)
- [x] **8.2** Create `frontend/Dockerfile` (multi-stage: Vite build + Nginx serve)
- [x] **8.3** Create `frontend/nginx.conf` (SPA routing + API proxy)
- [x] **8.4** Create `compose.yml` at root (backend + frontend services, SQLite volume)
- [x] **8.5** Update `README.md` with complete instructions (local dev + Docker)
- [x] **8.6** Initial commit with full working application
