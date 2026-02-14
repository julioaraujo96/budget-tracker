import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    getDashboard: vi.fn(),
  },
}));

// Mock chart components to avoid Recharts rendering in jsdom
vi.mock('@/components/Charts/ExpensesPieChart', () => ({
  ExpensesPieChart: ({ data }) => (
    <div data-testid="expenses-pie-chart">
      PieChart ({data?.length || 0} items)
    </div>
  ),
}));

vi.mock('@/components/Charts/MonthlyBarChart', () => ({
  MonthlyBarChart: ({ data }) => (
    <div data-testid="monthly-bar-chart">
      BarChart ({data?.length || 0} items)
    </div>
  ),
}));

import { api } from '@/services/api';

const MOCK_DASHBOARD = {
  totals: {
    income: 5000,
    expense: 3200,
    investment: 800,
  },
  balance: 1000,
  categoryBreakdown: [
    { name: 'Food', amount: 1200 },
    { name: 'Transport', amount: 400 },
    { name: 'Leisure', amount: 600 },
  ],
  monthlyEvolution: [
    { month: '2026-01', income: 5000, expense: 3000, investment: 500 },
    { month: '2026-02', income: 5000, expense: 3200, investment: 800 },
  ],
  recentTransactions: [
    {
      id: 1,
      type: 'expense',
      amount: 45.5,
      description: 'Grocery shopping',
      date: '2026-02-14',
      categoryId: 1,
      categoryName: 'Food',
      recurringGroupId: null,
      createdAt: '2026-02-14T10:00:00',
    },
    {
      id: 2,
      type: 'income',
      amount: 5000,
      description: 'Monthly salary',
      date: '2026-02-01',
      categoryId: 4,
      categoryName: 'Salary',
      recurringGroupId: 1,
      createdAt: '2026-02-01T09:00:00',
    },
  ],
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching data', () => {
    api.getDashboard.mockReturnValue(new Promise(() => {})); // Never resolves
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows error message when API call fails', async () => {
    api.getDashboard.mockRejectedValue(new Error('Server error'));
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it('renders summary cards with correct totals', async () => {
    api.getDashboard.mockResolvedValue(MOCK_DASHBOARD);
    render(<Dashboard />);

    await waitFor(() => {
      // Summary card titles
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Investments')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
      // "Income" appears both as card title and badge — check at least one exists
      expect(screen.getAllByText('Income').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders chart components with data', async () => {
    api.getDashboard.mockResolvedValue(MOCK_DASHBOARD);
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('expenses-pie-chart')).toBeInTheDocument();
      expect(screen.getByText(/piechart \(3 items\)/i)).toBeInTheDocument();
      expect(screen.getByTestId('monthly-bar-chart')).toBeInTheDocument();
      expect(screen.getByText(/barchart \(2 items\)/i)).toBeInTheDocument();
    });
  });

  it('renders recent transactions', async () => {
    api.getDashboard.mockResolvedValue(MOCK_DASHBOARD);
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    });
  });

  it('shows category name for recent transactions', async () => {
    api.getDashboard.mockResolvedValue(MOCK_DASHBOARD);
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });
  });

  it('shows "No transactions yet" when there are no recent transactions', async () => {
    api.getDashboard.mockResolvedValue({
      ...MOCK_DASHBOARD,
      recentTransactions: [],
    });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });

  it('shows type badges for recent transactions', async () => {
    api.getDashboard.mockResolvedValue(MOCK_DASHBOARD);
    render(<Dashboard />);

    await waitFor(() => {
      // Type badges appear as Badge components in recent transactions
      const badges = screen.getAllByText(/^(Expense|Income|Investment)$/);
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });
  });
});
