import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionList } from '../TransactionList';

// Mock hooks
const mockCreateTransaction = vi.fn();
const mockCreateRecurringTransaction = vi.fn();
const mockUpdateTransaction = vi.fn();
const mockDeleteTransaction = vi.fn();
const mockRefresh = vi.fn();
const mockSetFilters = vi.fn();

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    transactions: mockTransactions,
    loading: mockLoading,
    error: mockError,
    filters: {},
    setFilters: mockSetFilters,
    refresh: mockRefresh,
    createTransaction: mockCreateTransaction,
    createRecurringTransaction: mockCreateRecurringTransaction,
    updateTransaction: mockUpdateTransaction,
    deleteTransaction: mockDeleteTransaction,
  }),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 1, name: 'Food', type: 'expense' },
      { id: 2, name: 'Transport', type: 'expense' },
      { id: 3, name: 'Salary', type: 'income' },
    ],
    loading: false,
    error: null,
  }),
}));

// Mock TransactionForm to simplify testing
vi.mock('../TransactionForm', () => ({
  TransactionForm: ({ open, onOpenChange }) =>
    open ? (
      <div data-testid="transaction-form-dialog">
        <button onClick={() => onOpenChange(false)}>Close Form</button>
      </div>
    ) : null,
}));

let mockTransactions = [];
let mockLoading = false;
let mockError = null;

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: 'expense',
    amount: 45.5,
    description: 'Grocery shopping',
    date: '2026-02-14',
    categoryId: 1,
    recurringGroupId: null,
    createdAt: '2026-02-14T10:00:00',
  },
  {
    id: 2,
    type: 'income',
    amount: 5000,
    description: 'Monthly salary',
    date: '2026-02-01',
    categoryId: 3,
    recurringGroupId: 1,
    createdAt: '2026-02-01T09:00:00',
  },
  {
    id: 3,
    type: 'investment',
    amount: 500,
    description: 'ETF purchase',
    date: '2026-02-10',
    categoryId: null,
    recurringGroupId: null,
    createdAt: '2026-02-10T14:00:00',
  },
];

describe('TransactionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactions = MOCK_TRANSACTIONS;
    mockLoading = false;
    mockError = null;
  });

  it('renders a loading spinner when loading', () => {
    mockLoading = true;
    mockTransactions = [];
    render(<TransactionList />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders an error message on API error', () => {
    mockError = 'Network error';
    render(<TransactionList />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows empty state when there are no transactions', () => {
    mockTransactions = [];
    render(<TransactionList />);
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.getByText(/add your first transaction/i)).toBeInTheDocument();
  });

  it('renders transaction rows with correct data', () => {
    render(<TransactionList />);
    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('ETF purchase')).toBeInTheDocument();
  });

  it('renders type badges for each transaction', () => {
    render(<TransactionList />);
    expect(screen.getByText('Expense')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Investment')).toBeInTheDocument();
  });

  it('shows category names for transactions with categories', () => {
    render(<TransactionList />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('shows "—" for transactions without a category', () => {
    render(<TransactionList />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('shows the total count of results', () => {
    render(<TransactionList />);
    expect(screen.getByText(/3 results/)).toBeInTheDocument();
  });

  it('opens the transaction form when "New Transaction" is clicked', async () => {
    const user = userEvent.setup();
    render(<TransactionList />);

    await user.click(screen.getByText('New Transaction'));
    expect(screen.getByTestId('transaction-form-dialog')).toBeInTheDocument();
  });

  it('calls deleteTransaction when delete is confirmed', async () => {
    const user = userEvent.setup();
    mockDeleteTransaction.mockResolvedValue();
    render(<TransactionList />);

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    expect(globalThis.confirm).toHaveBeenCalled();
    expect(mockDeleteTransaction).toHaveBeenCalledWith(1);
  });

  it('does not delete when confirmation is cancelled', async () => {
    globalThis.confirm.mockReturnValueOnce(false);
    const user = userEvent.setup();
    render(<TransactionList />);

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    expect(mockDeleteTransaction).not.toHaveBeenCalled();
  });

  it('renders filter controls', () => {
    render(<TransactionList />);
    // "Type" and "Category" appear both as filter labels and table headers
    // Use getAllByText to account for duplicates
    expect(screen.getAllByText('Type').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Category').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('renders Refresh and New Transaction buttons', () => {
    render(<TransactionList />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('New Transaction')).toBeInTheDocument();
  });

  it('calls refresh when Refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<TransactionList />);

    await user.click(screen.getByText('Refresh'));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
