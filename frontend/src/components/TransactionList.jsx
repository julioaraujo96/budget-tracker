import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency, formatDate, capitalize } from '@/utils/formatters';
import { TransactionForm } from '@/components/TransactionForm';

/**
 * Badge color classes for each transaction type.
 */
const TYPE_BADGE_CLASSES = {
  income: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expense: 'bg-red-100 text-red-700 border-red-200',
  investment: 'bg-blue-100 text-blue-700 border-blue-200',
};

/**
 * Amount text color for each transaction type.
 */
const AMOUNT_COLOR = {
  income: 'text-emerald-600',
  expense: 'text-red-600',
  investment: 'text-blue-600',
};

/**
 * TransactionList component.
 *
 * Displays a filterable, paginated table of transactions with
 * inline edit/delete actions and a dialog form for create/edit.
 */
export function TransactionList() {
  const {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createTransaction,
    createRecurringTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const { categories } = useCategories();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Opens the form dialog for creating a new transaction.
   */
  const handleCreate = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  /**
   * Opens the form dialog for editing an existing transaction.
   */
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  /**
   * Deletes a transaction with confirmation.
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteTransaction(id);
    } catch {
      // Error is handled by the hook
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Saves a new or updated transaction.
   */
  const handleSave = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
  };

  /**
   * Saves a recurring transaction.
   */
  const handleSaveRecurring = async (data) => {
    await createRecurringTransaction(data);
  };

  /**
   * Updates a filter value.
   */
  const updateFilter = useCallback(
    (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === 'all' ? undefined : value,
      }));
    },
    [setFilters],
  );

  /**
   * Looks up a category name by ID.
   */
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '—';
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || '—';
  };

  return (
    <div className="space-y-4">
      {/* ── Filters ──────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            {/* Type filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(val) => updateFilter('type', val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <Select
                value={filters.categoryId?.toString() || 'all'}
                onValueChange={(val) => updateFilter('categoryId', val)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                From
              </label>
              <Input
                type="date"
                className="w-[150px]"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
              />
            </div>

            {/* End date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                className="w-[150px]"
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
              />
            </div>

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleCreate}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Transaction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Table ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Transactions
            {!loading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({transactions.length} result{transactions.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex h-32 items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                No transactions found
              </p>
              <Button variant="outline" size="sm" onClick={handleCreate}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add your first transaction
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={TYPE_BADGE_CLASSES[tx.type]}
                      >
                        {capitalize(tx.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.description || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getCategoryName(tx.categoryId)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium tabular-nums ${AMOUNT_COLOR[tx.type]}`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(tx)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          title="Delete"
                        >
                          {deletingId === tx.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Transaction Form Dialog ──────────────────────── */}
      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editingTransaction}
        onSave={handleSave}
        onSaveRecurring={handleSaveRecurring}
      />
    </div>
  );
}
