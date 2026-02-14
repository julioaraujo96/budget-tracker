import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCategories } from '@/hooks/useCategories';
import { today } from '@/utils/formatters';

/**
 * Default empty form state.
 */
const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  description: '',
  date: today(),
  categoryId: '',
  isRecurring: false,
  frequency: 'monthly',
};

/**
 * Dialog form for creating or editing a transaction.
 * Supports both single and recurring transactions.
 *
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onOpenChange - Callback to toggle the dialog
 * @param {object|null} props.transaction - Transaction to edit (null for create)
 * @param {function} props.onSave - Callback after save (receives the created/updated transaction)
 * @param {function} props.onSaveRecurring - Callback for recurring save
 */
export function TransactionForm({
  open,
  onOpenChange,
  transaction = null,
  onSave,
  onSaveRecurring,
}) {
  const { categories } = useCategories();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!transaction;

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type || 'expense',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        date: transaction.date || today(),
        categoryId: transaction.categoryId?.toString() || '',
        isRecurring: false,
        frequency: 'monthly',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [transaction, open]);

  /**
   * Updates a single form field.
   */
  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // When type changes, reset categoryId since categories are type-specific
      if (field === 'type') {
        next.categoryId = '';
      }
      return next;
    });
  };

  /**
   * Filtered categories based on selected type.
   */
  const filteredCategories = categories.filter((c) => c.type === form.type);

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description || undefined,
        date: form.date,
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : undefined,
      };

      if (!payload.amount || payload.amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      if (!payload.date) {
        throw new Error('Date is required');
      }

      if (form.isRecurring && !isEditing && onSaveRecurring) {
        await onSaveRecurring({ ...payload, frequency: form.frequency });
      } else {
        await onSave(payload);
      }

      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the transaction details below.'
              : 'Fill in the details to create a new transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Type ──────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="tx-type">Type</Label>
            <Select
              value={form.type}
              onValueChange={(val) => updateField('type', val)}
            >
              <SelectTrigger id="tx-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Amount ────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="tx-amount">Amount (EUR)</Label>
            <Input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => updateField('amount', e.target.value)}
              required
            />
          </div>

          {/* ── Description ───────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="tx-description">Description</Label>
            <Input
              id="tx-description"
              type="text"
              placeholder="e.g. Grocery shopping"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          {/* ── Date ──────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="tx-date">Date</Label>
            <Input
              id="tx-date"
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              required
            />
          </div>

          {/* ── Category ──────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="tx-category">Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(val) => updateField('categoryId', val)}
            >
              <SelectTrigger id="tx-category" className="w-full">
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No categories for this type
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ── Recurring toggle (only for new transactions) ── */}
          {!isEditing && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <input
                  id="tx-recurring"
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => updateField('isRecurring', e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <Label htmlFor="tx-recurring" className="cursor-pointer">
                  Recurring transaction
                </Label>
              </div>

              {form.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="tx-frequency">Frequency</Label>
                  <Select
                    value={form.frequency}
                    onValueChange={(val) => updateField('frequency', val)}
                  >
                    <SelectTrigger id="tx-frequency" className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This will generate 12 occurrences automatically.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Error ─────────────────────────────────────── */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* ── Actions ───────────────────────────────────── */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Update'
                  : form.isRecurring
                    ? 'Create Recurring'
                    : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
