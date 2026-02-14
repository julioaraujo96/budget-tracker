import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from '../TransactionForm';

// Mock useCategories hook
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 1, name: 'Food', type: 'expense' },
      { id: 2, name: 'Transport', type: 'expense' },
      { id: 3, name: 'Salary', type: 'income' },
      { id: 4, name: 'Stocks', type: 'investment' },
    ],
    loading: false,
    error: null,
  }),
}));

describe('TransactionForm', () => {
  const mockOnSave = vi.fn();
  const mockOnSaveRecurring = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    transaction: null,
    onSave: mockOnSave,
    onSaveRecurring: mockOnSaveRecurring,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue({});
    mockOnSaveRecurring.mockResolvedValue({});
  });

  it('renders dialog with "New Transaction" title when creating', () => {
    render(<TransactionForm {...defaultProps} />);
    expect(screen.getByText('New Transaction')).toBeInTheDocument();
  });

  it('renders dialog with "Edit Transaction" title when editing', () => {
    const transaction = {
      id: 1,
      type: 'expense',
      amount: 50,
      description: 'Test',
      date: '2026-02-14',
      categoryId: 1,
    };
    render(<TransactionForm {...defaultProps} transaction={transaction} />);
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<TransactionForm {...defaultProps} />);
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (EUR)')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('renders recurring checkbox for new transactions', () => {
    render(<TransactionForm {...defaultProps} />);
    expect(screen.getByLabelText('Recurring transaction')).toBeInTheDocument();
  });

  it('does not render recurring checkbox when editing', () => {
    const transaction = {
      id: 1,
      type: 'expense',
      amount: 50,
      description: 'Test',
      date: '2026-02-14',
      categoryId: 1,
    };
    render(<TransactionForm {...defaultProps} transaction={transaction} />);
    expect(screen.queryByLabelText('Recurring transaction')).not.toBeInTheDocument();
  });

  it('shows frequency picker when recurring is checked', async () => {
    const user = userEvent.setup();
    render(<TransactionForm {...defaultProps} />);

    await user.click(screen.getByLabelText('Recurring transaction'));
    expect(screen.getByLabelText('Frequency')).toBeInTheDocument();
    expect(screen.getByText(/12 occurrences/i)).toBeInTheDocument();
  });

  it('populates form fields when editing a transaction', () => {
    const transaction = {
      id: 1,
      type: 'expense',
      amount: 99.99,
      description: 'Restaurant dinner',
      date: '2026-02-10',
      categoryId: 1,
    };
    render(<TransactionForm {...defaultProps} transaction={transaction} />);

    expect(screen.getByLabelText('Amount (EUR)')).toHaveValue(99.99);
    expect(screen.getByLabelText('Description')).toHaveValue('Restaurant dinner');
    expect(screen.getByLabelText('Date')).toHaveValue('2026-02-10');
  });

  it('calls onSave with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<TransactionForm {...defaultProps} />);

    await user.clear(screen.getByLabelText('Amount (EUR)'));
    await user.type(screen.getByLabelText('Amount (EUR)'), '75.50');
    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Test purchase');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          amount: 75.5,
          description: 'Test purchase',
        }),
      );
    });
  });

  it('calls onSaveRecurring when recurring is enabled', async () => {
    const user = userEvent.setup();
    render(<TransactionForm {...defaultProps} />);

    await user.clear(screen.getByLabelText('Amount (EUR)'));
    await user.type(screen.getByLabelText('Amount (EUR)'), '100');

    await user.click(screen.getByLabelText('Recurring transaction'));

    await user.click(screen.getByRole('button', { name: 'Create Recurring' }));

    await waitFor(() => {
      expect(mockOnSaveRecurring).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          amount: 100,
          frequency: 'monthly',
        }),
      );
    });
  });

  it('shows Cancel and Create buttons', () => {
    render(<TransactionForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('shows Update button when editing', () => {
    const transaction = {
      id: 1,
      type: 'expense',
      amount: 50,
      description: 'Test',
      date: '2026-02-14',
    };
    render(<TransactionForm {...defaultProps} transaction={transaction} />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('closes dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<TransactionForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not render when open is false', () => {
    render(<TransactionForm {...defaultProps} open={false} />);
    expect(screen.queryByText('New Transaction')).not.toBeInTheDocument();
  });
});
