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
  Building2,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

const SUPPLIERS_KEY = "truffleur_suppliers";

export type Supplier = {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productCategory: string;
  paymentTerms: string;
  leadTimeDays: string;
  notes: string;
  createdAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Truffles: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Flowers: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Gift Boxes": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Seasonal: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Other: "bg-muted/10 text-muted-foreground border-muted/20",
};

const PAYMENT_TERMS = [
  "Net 30",
  "Net 60",
  "Net 90",
  "Prepaid",
  "Cash on Delivery",
  "Weekly",
  "Monthly",
];

const EMPTY_FORM: Omit<Supplier, "id" | "createdAt"> = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  productCategory: "Truffles",
  paymentTerms: "Net 30",
  leadTimeDays: "",
  notes: "",
};

function loadSuppliers(): Supplier[] {
  try {
    return JSON.parse(localStorage.getItem(SUPPLIERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSuppliers(suppliers: Supplier[]) {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] =
    useState<Omit<Supplier, "id" | "createdAt">>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditingId(s.id);
    setForm({
      companyName: s.companyName,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      productCategory: s.productCategory,
      paymentTerms: s.paymentTerms,
      leadTimeDays: s.leadTimeDays,
      notes: s.notes,
    });
    setDialogOpen(true);
  }

  function saveSupplier() {
    if (!form.companyName.trim()) return;
    let updated: Supplier[];
    if (isEditing && editingId) {
      updated = suppliers.map((s) =>
        s.id === editingId ? { ...s, ...form } : s,
      );
    } else {
      const newSupplier: Supplier = {
        ...form,
        id: `sup_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [...suppliers, newSupplier];
    }
    saveSuppliers(updated);
    setSuppliers(updated);
    setDialogOpen(false);
    setEditingId(null);
  }

  function confirmDelete(id: string) {
    const updated = suppliers.filter((s) => s.id !== id);
    saveSuppliers(updated);
    setSuppliers(updated);
    setDeleteConfirmId(null);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            Management
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
            Suppliers
          </h1>
        </div>
        <Button
          data-ocid="suppliers.add_supplier.button"
          className="gap-2"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="shadow-card border-border/50 col-span-2">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Total Suppliers
                </p>
                <p className="font-display text-3xl font-semibold text-foreground">
                  {suppliers.length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/50">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50 col-span-2">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Categories Covered
                </p>
                <p className="font-display text-3xl font-semibold text-foreground">
                  {new Set(suppliers.map((s) => s.productCategory)).size}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary">
                <Building2 className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier grid */}
      {suppliers.length === 0 ? (
        <div
          data-ocid="suppliers.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl mb-1">No suppliers yet</p>
          <p className="text-sm">Add your first supplier to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s, idx) => {
            const categoryColor =
              CATEGORY_COLORS[s.productCategory] ??
              "bg-muted/10 text-muted-foreground border-muted/20";
            return (
              <div
                key={s.id}
                data-ocid={`suppliers.item.${idx + 1}`}
                className="group bg-card border border-border/50 hover:border-primary/30 hover:shadow-card rounded-xl p-5 transition-all duration-200"
              >
                {/* Card top row */}
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${categoryColor}`}
                  >
                    {s.productCategory}
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      data-ocid={`suppliers.edit_button.${idx + 1}`}
                      onClick={() => openEdit(s)}
                      title="Edit supplier"
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`suppliers.delete_button.${idx + 1}`}
                      onClick={() => setDeleteConfirmId(s.id)}
                      title="Delete supplier"
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Company name */}
                <h3 className="font-display text-base font-semibold text-foreground mb-3 leading-snug">
                  {s.companyName}
                </h3>

                {/* Contact details */}
                <div className="space-y-1.5 mb-3">
                  {s.contactPerson && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span>{s.contactPerson}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}
                </div>

                {/* Terms row */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Payment
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {s.paymentTerms || "—"}
                    </p>
                  </div>
                  {s.leadTimeDays && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        Lead Time
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {s.leadTimeDays} days
                      </p>
                    </div>
                  )}
                </div>

                {s.notes && (
                  <p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">
                    {s.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Supplier Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent
          className="max-w-lg flex flex-col max-h-[90dvh]"
          data-ocid="suppliers.dialog"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-display text-2xl">
              {isEditing ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-company">Company Name *</Label>
              <Input
                id="sup-company"
                data-ocid="suppliers.company_name.input"
                value={form.companyName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, companyName: e.target.value }))
                }
                placeholder="e.g. Truffle Masters Ltd."
              />
            </div>

            {/* Contact Person */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-contact">Contact Person</Label>
              <Input
                id="sup-contact"
                data-ocid="suppliers.contact_person.input"
                value={form.contactPerson}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPerson: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sup-phone">Phone</Label>
                <Input
                  id="sup-phone"
                  data-ocid="suppliers.phone.input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+389 ..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sup-email">Email</Label>
                <Input
                  id="sup-email"
                  data-ocid="suppliers.email.input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="supplier@email.com"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-address">Address</Label>
              <Input
                id="sup-address"
                data-ocid="suppliers.address.input"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Street, City, Country"
              />
            </div>

            {/* Product Category */}
            <div className="space-y-1.5">
              <Label>Product Category</Label>
              <Select
                value={form.productCategory}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, productCategory: v }))
                }
              >
                <SelectTrigger data-ocid="suppliers.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Truffles",
                    "Flowers",
                    "Gift Boxes",
                    "Seasonal",
                    "Other",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Terms & Lead Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Payment Terms</Label>
                <Select
                  value={form.paymentTerms}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, paymentTerms: v }))
                  }
                >
                  <SelectTrigger data-ocid="suppliers.payment_terms.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sup-lead">Lead Time (days)</Label>
                <Input
                  id="sup-lead"
                  data-ocid="suppliers.lead_time.input"
                  type="number"
                  min="0"
                  value={form.leadTimeDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leadTimeDays: e.target.value }))
                  }
                  placeholder="e.g. 7"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-notes">Notes</Label>
              <Textarea
                id="sup-notes"
                data-ocid="suppliers.notes.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-2">
            <Button
              variant="outline"
              data-ocid="suppliers.cancel.button"
              onClick={() => {
                setDialogOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="suppliers.save.button"
              onClick={saveSupplier}
              disabled={!form.companyName.trim()}
            >
              {isEditing ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="suppliers.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Delete Supplier?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This supplier will be removed from your list. This action cannot be
            undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="suppliers.delete.cancel_button"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="suppliers.delete.confirm_button"
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
