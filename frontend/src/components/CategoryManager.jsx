import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { capitalize } from '@/utils/formatters';
import { ConfirmDialog } from '@/components/ConfirmDialog';

/**
 * Badge color classes for each category type.
 */
const TYPE_BADGE_CLASSES = {
  income: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expense: 'bg-red-100 text-red-700 border-red-200',
  investment: 'bg-blue-100 text-blue-700 border-blue-200',
};

/**
 * Default empty form state for category creation/editing.
 */
const EMPTY_FORM = {
  name: '',
  type: 'expense',
};

/**
 * CategoryManager component.
 *
 * Provides a full CRUD interface for managing budget categories.
 * Categories are associated with a transaction type (expense/income/investment).
 */
export function CategoryManager() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  /**
   * Opens dialog for creating a new category.
   */
  const handleCreate = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  /**
   * Opens dialog for editing an existing category.
   */
  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name, type: category.type });
    setFormError(null);
    setDialogOpen(true);
  };

  /**
   * Opens the confirmation dialog for deleting a category.
   */
  const handleDelete = (id) => {
    setDeleteError(null);
    setConfirmDeleteId(id);
  };

  /**
   * Executes the deletion after user confirms via the dialog.
   */
  const confirmDelete = async () => {
    const id = confirmDeleteId;
    try {
      setDeletingId(id);
      setDeleteError(null);
      await deleteCategory(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category. It may have associated transactions.');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Saves the category (create or update).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      if (!form.name.trim()) {
        throw new Error('Name is required');
      }

      const payload = {
        name: form.name.trim(),
        type: form.type,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setDialogOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Groups categories by type for organized display.
   */
  const groupedCategories = {
    expense: categories.filter((c) => c.type === 'expense'),
    income: categories.filter((c) => c.type === 'income'),
    investment: categories.filter((c) => c.type === 'investment'),
  };

  return (
    <div className="space-y-4">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Category
        </Button>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load categories: {error}
            </p>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 flex-col items-center justify-center gap-2 pt-6">
            <p className="text-sm text-muted-foreground">
              No categories yet
            </p>
            <Button variant="outline" size="sm" onClick={handleCreate}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create your first category
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Render a table for each type group that has categories */
        Object.entries(groupedCategories).map(([type, items]) => {
          if (items.length === 0) return null;
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge
                    variant="outline"
                    className={TYPE_BADGE_CLASSES[type]}
                  >
                    {capitalize(type)}
                  </Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({items.length} categor{items.length !== 1 ? 'ies' : 'y'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">
                          {cat.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(cat)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(cat.id)}
                              disabled={deletingId === cat.id}
                              title="Delete"
                            >
                              {deletingId === cat.id ? (
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
              </CardContent>
            </Card>
          );
        })
      )}

      {/* ── Category Form Dialog ─────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category details below.'
                : 'Create a new category for organizing transactions.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                type="text"
                placeholder="e.g. Food, Salary, Stocks"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger id="cat-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Saving...'
                  : editingCategory
                    ? 'Update'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────── */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) { setConfirmDeleteId(null); setDeleteError(null); } }}
        title="Delete category"
        description={
          deleteError
            ? deleteError
            : 'Are you sure you want to delete this category? It cannot be deleted if transactions are associated with it.'
        }
        confirmLabel={deleteError ? 'Try again' : 'Delete'}
        loading={deletingId !== null}
        onConfirm={deleteError ? () => { setDeleteError(null); confirmDelete(); } : confirmDelete}
      />
    </div>
  );
}
