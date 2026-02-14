import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Delete Transaction',
    description: 'Are you sure you want to delete this?',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title and description when open', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Transaction')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this?'),
    ).toBeInTheDocument();
  });

  it('should render Cancel and default Delete buttons', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should use custom confirm label', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Remove" />);

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable buttons when loading', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
  });

  it('should not render dialog content when open is false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Delete Transaction')).not.toBeInTheDocument();
  });
});
