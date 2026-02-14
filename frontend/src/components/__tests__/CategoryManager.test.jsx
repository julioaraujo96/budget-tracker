import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryManager } from '../CategoryManager';

const mockCreateCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockDeleteCategory = vi.fn();

let mockCategories = [];
let mockLoading = false;
let mockError = null;

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    loading: mockLoading,
    error: mockError,
    refresh: vi.fn(),
    createCategory: mockCreateCategory,
    updateCategory: mockUpdateCategory,
    deleteCategory: mockDeleteCategory,
  }),
}));

const MOCK_CATEGORIES = [
  { id: 1, name: 'Food', type: 'expense' },
  { id: 2, name: 'Transport', type: 'expense' },
  { id: 3, name: 'Leisure', type: 'expense' },
  { id: 4, name: 'Salary', type: 'income' },
  { id: 5, name: 'Freelance', type: 'income' },
  { id: 6, name: 'Stocks', type: 'investment' },
  { id: 7, name: 'ETFs', type: 'investment' },
];

describe('CategoryManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories = MOCK_CATEGORIES;
    mockLoading = false;
    mockError = null;
    mockCreateCategory.mockResolvedValue({});
    mockUpdateCategory.mockResolvedValue({});
    mockDeleteCategory.mockResolvedValue();
  });

  it('renders the header and New Category button', () => {
    render(<CategoryManager />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Manage your transaction categories')).toBeInTheDocument();
    expect(screen.getByText('New Category')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockLoading = true;
    mockCategories = [];
    render(<CategoryManager />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows error message on API error', () => {
    mockError = 'Failed to fetch';
    render(<CategoryManager />);
    expect(screen.getByText(/failed to load categories/i)).toBeInTheDocument();
  });

  it('shows empty state when no categories exist', () => {
    mockCategories = [];
    render(<CategoryManager />);
    expect(screen.getByText('No categories yet')).toBeInTheDocument();
    expect(screen.getByText(/create your first category/i)).toBeInTheDocument();
  });

  it('groups categories by type with badges', () => {
    render(<CategoryManager />);
    // Should have type group badges
    const expenseBadges = screen.getAllByText('Expense');
    expect(expenseBadges.length).toBeGreaterThanOrEqual(1);
    const incomeBadges = screen.getAllByText('Income');
    expect(incomeBadges.length).toBeGreaterThanOrEqual(1);
    const investmentBadges = screen.getAllByText('Investment');
    expect(investmentBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all category names', () => {
    render(<CategoryManager />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Leisure')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Freelance')).toBeInTheDocument();
    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText('ETFs')).toBeInTheDocument();
  });

  it('shows count per type group', () => {
    render(<CategoryManager />);
    expect(screen.getByText('(3 categories)')).toBeInTheDocument(); // expense
    // Both income and investment have 2 categories each
    const twoCategoryLabels = screen.getAllByText('(2 categories)');
    expect(twoCategoryLabels.length).toBe(2); // income + investment
  });

  it('renders edit and delete buttons for each category', () => {
    render(<CategoryManager />);
    const editButtons = screen.getAllByTitle('Edit');
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(editButtons.length).toBe(MOCK_CATEGORIES.length);
    expect(deleteButtons.length).toBe(MOCK_CATEGORIES.length);
  });

  it('opens "New Category" dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    await user.click(screen.getByText('New Category'));
    expect(screen.getByText('New Category', { selector: '[data-slot="dialog-title"]' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });

  it('opens "Edit Category" dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]); // Edit first category (Food)

    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Food');
  });

  it('calls createCategory when form is submitted for new category', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    await user.click(screen.getByText('New Category'));

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'Health');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'Health',
        type: 'expense',
      });
    });
  });

  it('calls deleteCategory when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]); // Delete first category

    expect(globalThis.confirm).toHaveBeenCalled();
    expect(mockDeleteCategory).toHaveBeenCalledWith(1);
  });

  it('does not delete when confirmation is cancelled', async () => {
    globalThis.confirm.mockReturnValueOnce(false);
    const user = userEvent.setup();
    render(<CategoryManager />);

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });

  it('shows error alert when delete fails', async () => {
    mockDeleteCategory.mockRejectedValue(new Error('Has associated transactions'));
    const user = userEvent.setup();
    render(<CategoryManager />);

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith('Has associated transactions');
    });
  });
});
