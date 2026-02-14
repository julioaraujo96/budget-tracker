# Budget Tracker

A personal finance management web application built with React, Node.js, Express, SQLite, and Drizzle ORM.

## Features

- **Transaction Management** — Create, edit, and delete financial transactions (expenses, income, investments)
- **Recurring Transactions** — Support for subscriptions and periodic transactions with automatic generation of occurrences
- **Category Management** — Customizable categories associated with transaction types
- **Dashboard Analytics** — Visual summary with charts showing financial health (pie charts, bar charts, balance overview)

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 19, Vite, shadcn/ui, Recharts    |
| Backend  | Node.js 20, Express, Zod               |
| Database | SQLite, Drizzle ORM                     |
| Styling  | Tailwind CSS v4                         |
| Deploy   | Docker + Docker Compose                 |

## Quick Start

### Option A: Docker (recommended)

The easiest way to run the full application. Requires only **Docker** and **Docker Compose**.

```bash
# Build and start both services
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

Once running:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)

The database is persisted in a named Docker volume (`budget-data`), so your data survives container restarts.

```bash
# Stop the services
docker compose down

# Stop and remove the database volume (resets all data)
docker compose down -v
```

### Option B: Local Development

Requires **Node.js 20 LTS** (or later) and **npm 9+**.

#### 1. Clone the repository

```bash
git clone <repository-url>
cd budget-tracker
```

#### 2. Backend setup

```bash
cd backend
cp .env.example .env   # or create .env with the variables below
npm install
npm run db:migrate      # create database tables
npm run db:seed         # seed default categories
npm run dev             # start dev server on port 3001
```

**Backend environment variables** (`.env`):

```
PORT=3001
DATABASE_PATH=./data/budget.db
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

#### 3. Frontend setup

```bash
cd frontend
cp .env.example .env   # or create .env with the variable below
npm install
npm run dev             # start dev server on port 5173
```

**Frontend environment variables** (`.env`):

```
VITE_API_URL=http://localhost:3001/api
```

#### 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## Running Tests

### Backend tests

```bash
cd backend
npm test
```

Backend tests use an in-memory SQLite database to avoid polluting the dev database.

### Frontend tests

```bash
cd frontend
npm test
```

## Project Structure

```
budget-tracker/
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── index.js        # Express entry point
│   │   ├── config/         # DB connection, app config
│   │   ├── db/             # Drizzle schema & migrations
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── middleware/      # Error handling, validation
│   │   └── utils/          # Helper functions
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   └── utils/          # Formatters, helpers
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  React + shadcn/ui + Recharts                                   │
│  - Dashboard with financial summary                             │
│  - Transaction list with filters                                │
│  - Category management                                          │
│  - Pie charts & bar charts                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/REST API
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS BACKEND (Port 3001)                     │
│  Routes → Validation (Zod) → Services → Repositories            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Drizzle ORM
                       ↓
                 ┌──────────────┐
                 │    SQLite    │
                 │  budget.db   │
                 └──────────────┘
```

## API Endpoints

### Transactions

| Method | Endpoint                               | Description                    |
| ------ | -------------------------------------- | ------------------------------ |
| GET    | `/api/transactions`                    | List (with filters)            |
| GET    | `/api/transactions/:id`               | Get by ID                      |
| POST   | `/api/transactions`                    | Create                         |
| PUT    | `/api/transactions/:id`               | Update                         |
| DELETE | `/api/transactions/:id`               | Delete                         |
| POST   | `/api/transactions/recurring`          | Create recurring               |
| GET    | `/api/transactions/recurring`          | List recurring groups          |
| DELETE | `/api/transactions/recurring/:groupId` | Cancel subscription            |
| PATCH  | `/api/transactions/recurring/:groupId` | Update future occurrences      |

### Categories

| Method | Endpoint               | Description |
| ------ | ---------------------- | ----------- |
| GET    | `/api/categories`      | List all    |
| POST   | `/api/categories`      | Create      |
| PUT    | `/api/categories/:id`  | Update      |
| DELETE | `/api/categories/:id`  | Delete      |

### Dashboard

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | `/api/dashboard` | Aggregated data  |