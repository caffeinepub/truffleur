import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Edit2,
  PlusCircle,
  Receipt,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

type ExpenseCategory =
  | "Ingredients"
  | "Packaging"
  | "Flowers"
  | "Delivery"
  | "Marketing"
  | "Equipment"
  | "Utilities"
  | "Other";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Ingredients",
  "Packaging",
  "Flowers",
  "Delivery",
  "Marketing",
  "Equipment",
  "Utilities",
  "Other",
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Ingredients: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Packaging: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Flowers: "bg-pink-50 text-pink-700 border-pink-100",
  Delivery: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Marketing: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Equipment: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Utilities: "bg-primary/10 text-primary border-primary/20",
  Other: "bg-muted/30 text-muted-foreground border-muted/40",
};

interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes: string;
}

const STORAGE_KEY = "truffleur_expenses";

function loadExpenses(): Expense[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

const EMPTY_FORM = {
  title: "",
  category: "Ingredients" as ExpenseCategory,
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const isEditing = editingId !== null;

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const monthly = expenses
      .filter((e) => e.date.startsWith(thisMonth))
      .reduce((s, e) => s + e.amount, 0);
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    }
    return { total, monthly, byCategory };
  }, [expenses]);

  const filtered = useMemo(
    () =>
      filterCategory === "All"
        ? expenses
        : expenses.filter((e) => e.category === filterCategory),
    [expenses, filterCategory],
  );

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      category: expense.category,
      amount: String(expense.amount),
      date: expense.date,
      notes: expense.notes,
    });
    setDialogOpen(true);
  }

  function saveExpense() {
    if (!form.title.trim() || !form.amount) return;
    const updated = isEditing
      ? expenses.map((e) =>
          e.id === editingId
            ? {
                ...e,
                title: form.title.trim(),
                category: form.category,
                amount: Number(form.amount),
                date: form.date,
                notes: form.notes,
              }
            : e,
        )
      : [
          ...expenses,
          {
            id: Date.now().toString(),
            title: form.title.trim(),
            category: form.category,
            amount: Number(form.amount),
            date: form.date,
            notes: form.notes,
          },
        ];
    setExpenses(updated);
    saveExpenses(updated);
    setDialogOpen(false);
    setEditingId(null);
  }

  function confirmDelete(id: string) {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
    setDeleteConfirmId(null);
  }

  const topCategory = useMemo(() => {
    const entries = Object.entries(stats.byCategory);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [stats.byCategory]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            Finance
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
            Expenses
          </h1>
        </div>
        <Button
          data-ocid="expenses.add_expense.button"
          className="gap-2"
          onClick={openAdd}
        >
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </Button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card className="shadow-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Total Expenses
                </p>
                <p className="font-display text-2xl font-semibold text-foreground">
                  {stats.total.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    MKD
                  </span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <Wallet className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  This Month
                </p>
                <p className="font-display text-2xl font-semibold text-foreground">
                  {stats.monthly.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    MKD
                  </span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/50">
                <TrendingDown className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50 col-span-2 md:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Top Category
                </p>
                <p className="font-display text-2xl font-semibold text-foreground">
                  {topCategory ? topCategory[0] : "—"}
                </p>
                {topCategory && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topCategory[1].toLocaleString()} MKD
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-secondary">
                <Receipt className="w-5 h-5 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
            By Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
                <div
                  key={cat}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    CATEGORY_COLORS[cat as ExpenseCategory] ??
                    "bg-muted/30 text-muted-foreground border-muted/40"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="font-semibold">
                    {amt.toLocaleString()} MKD
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["All", ...EXPENSE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            data-ocid={"expenses.filter.tab"}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      {filtered.length === 0 ? (
        <div
          data-ocid="expenses.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl mb-1">
            {filterCategory === "All"
              ? "No expenses yet"
              : `No ${filterCategory} expenses`}
          </p>
          <p className="text-sm">
            Track your business costs to see profit margins accurately.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((expense, idx) => (
              <div
                key={expense.id}
                data-ocid={`expenses.item.${idx + 1}`}
                className="group bg-card border border-border/50 hover:border-primary/30 hover:shadow-card rounded-xl px-5 py-4 transition-all duration-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0">
                    <p className="text-xs font-semibold text-primary">
                      {new Date(expense.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(expense.date).getFullYear()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {expense.title}
                    </p>
                    {expense.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs hidden sm:inline-flex ${
                      CATEGORY_COLORS[expense.category] ??
                      "bg-muted/30 text-muted-foreground border-muted/40"
                    }`}
                  >
                    {expense.category}
                  </Badge>
                  <p className="text-sm font-semibold text-foreground">
                    {expense.amount.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      MKD
                    </span>
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      data-ocid={`expenses.edit_button.${idx + 1}`}
                      onClick={() => openEdit(expense)}
                      title="Edit expense"
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`expenses.delete_button.${idx + 1}`}
                      onClick={() => setDeleteConfirmId(expense.id)}
                      title="Delete expense"
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent
          className="max-w-md flex flex-col max-h-[90dvh]"
          data-ocid="expenses.dialog"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-display text-2xl">
              {isEditing ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="expense-title">Description</Label>
              <Input
                id="expense-title"
                data-ocid="expenses.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Truffle ingredient order"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ExpenseCategory }))
                }
              >
                <SelectTrigger data-ocid="expenses.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expense-amount">Amount (MKD)</Label>
                <Input
                  id="expense-amount"
                  data-ocid="expenses.amount.input"
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  data-ocid="expenses.date.input"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-notes">Notes (optional)</Label>
              <Textarea
                id="expense-notes"
                data-ocid="expenses.notes.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Additional details..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 pt-2">
            <Button
              variant="outline"
              data-ocid="expenses.cancel.button"
              onClick={() => {
                setDialogOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="expenses.save.button"
              onClick={saveExpense}
              disabled={!form.title.trim() || !form.amount}
            >
              {isEditing ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="expenses.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Delete Expense?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This expense will be permanently removed. This action cannot be
            undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="expenses.delete.cancel_button"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="expenses.delete.confirm_button"
              onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
