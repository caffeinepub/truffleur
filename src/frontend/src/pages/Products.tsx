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
import {
  useAddProduct,
  useGetAllProducts,
  useUpdateProduct,
} from "@/hooks/useQueries";
import {
  Download,
  Edit2,
  LayoutGrid,
  PackagePlus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

type ProductCategory =
  | "Truffles"
  | "Flowers"
  | "Madeleines"
  | "Cake Pops"
  | "Macarons"
  | "Oreshki"
  | "NYC Cookies"
  | "Cakesicles"
  | "Other";

const CATEGORIES: ProductCategory[] = [
  "Truffles",
  "Flowers",
  "Madeleines",
  "Cake Pops",
  "Macarons",
  "Oreshki",
  "NYC Cookies",
  "Cakesicles",
  "Other",
];

// Normalise old singular category names stored in backend -> plural display names
const CATEGORY_NORMALISE: Record<string, string> = {
  Truffle: "Truffles",
  Flower: "Flowers",
  Madeleine: "Madeleines",
  "Cake Pop": "Cake Pops",
};

export function normaliseCat(cat: string): string {
  return CATEGORY_NORMALISE[cat] ?? cat;
}

const CATEGORY_COLORS: Record<string, string> = {
  // Plural (new)
  Truffles: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Flowers: "bg-pink-50 text-pink-700 border-pink-100",
  Madeleines: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Cake Pops": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Macarons: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Oreshki: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  "NYC Cookies": "bg-primary/10 text-primary border-primary/20",
  Cakesicles: "bg-rose-50 text-rose-600 border-rose-100",
  Other: "bg-muted/30 text-muted-foreground border-muted/40",
  // Legacy singular (backward compat)
  Truffle: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Flower: "bg-pink-50 text-pink-700 border-pink-100",
  Madeleine: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Cake Pop": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  // More legacy
  "Gift Boxes": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Seasonal: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

const EMPTY_FORM = {
  name: "",
  category: "Truffles" as ProductCategory,
  basePrice: "",
  costPrice: "",
};

export const HIDDEN_PRODUCTS_KEY = "truffleur_hidden_products";

export function getHiddenIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_PRODUCTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addHiddenId(id: string) {
  const ids = getHiddenIds();
  if (!ids.includes(id)) {
    localStorage.setItem(HIDDEN_PRODUCTS_KEY, JSON.stringify([...ids, id]));
  }
}

function exportProductsCSV(
  products: Array<{
    id: bigint;
    name: string;
    category: string;
    basePrice: bigint;
    costPrice: bigint;
  }>,
) {
  const headers = [
    "Category",
    "Product Name",
    "Price (MKD)",
    "Cost (MKD)",
    "Margin (%)",
  ];
  const csvEscape = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`;
  const rows = products.map((p) => {
    const price = Number(p.basePrice);
    const cost = Number(p.costPrice);
    const margin =
      price > 0 ? (((price - cost) / price) * 100).toFixed(1) : "0.0";
    return [
      csvEscape(normaliseCat(p.category)),
      csvEscape(p.name),
      csvEscape(price),
      csvEscape(cost),
      csvEscape(margin),
    ];
  });
  const csv = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `truffleur-products-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Products() {
  const { data: rawProducts = [], isLoading } = useGetAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [hiddenIds, setHiddenIds] = useState<string[]>(getHiddenIds);
  const products = rawProducts.filter((p) => !hiddenIds.includes(String(p.id)));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  const totalCatalogValue = products.reduce(
    (s, p) => s + Number(p.basePrice),
    0,
  );
  const avgMargin =
    products.length > 0
      ? products.reduce(
          (s, p) =>
            s +
            (Number(p.basePrice) > 0
              ? ((Number(p.basePrice) - Number(p.costPrice)) /
                  Number(p.basePrice)) *
                100
              : 0),
          0,
        ) / products.length
      : 0;

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(product: {
    id: bigint;
    name: string;
    category: string;
    basePrice: bigint;
    costPrice: bigint;
  }) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: normaliseCat(product.category) as ProductCategory,
      basePrice: String(product.basePrice),
      costPrice: String(product.costPrice),
    });
    setDialogOpen(true);
  }

  async function saveProduct() {
    if (!form.name.trim()) return;
    if (isEditing && editingId !== null) {
      await updateProduct.mutateAsync({
        id: editingId,
        name: form.name.trim(),
        category: form.category,
        basePrice: BigInt(Number(form.basePrice) || 0),
        costPrice: BigInt(Number(form.costPrice) || 0),
      });
    } else {
      await addProduct.mutateAsync({
        name: form.name.trim(),
        category: form.category,
        basePrice: BigInt(Number(form.basePrice) || 0),
        costPrice: BigInt(Number(form.costPrice) || 0),
      });
    }
    setDialogOpen(false);
    setEditingId(null);
  }

  function confirmDelete(id: string) {
    addHiddenId(id);
    setHiddenIds(getHiddenIds());
    setDeleteConfirmId(null);
    window.dispatchEvent(new CustomEvent("truffleur-products-updated"));
  }

  const isPending = addProduct.isPending || updateProduct.isPending;

  // Group products by normalised category for display
  const DISPLAY_ORDER = [
    "Truffles",
    "Flowers",
    "Madeleines",
    "Cake Pops",
    "Macarons",
    "Oreshki",
    "NYC Cookies",
    "Cakesicles",
    "Other",
  ];

  const grouped = DISPLAY_ORDER.map((displayCat) => ({
    category: displayCat,
    items: products
      .filter((p) => normaliseCat(p.category) === displayCat)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            Catalogue
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
            Products
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="products.export_csv.button"
            variant="outline"
            className="gap-2"
            disabled={products.length === 0}
            onClick={() => exportProductsCSV(products)}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            data-ocid="products.add_product.button"
            className="gap-2"
            onClick={openAdd}
          >
            <PackagePlus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Card className="shadow-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Catalogue Value
                </p>
                <p className="font-display text-3xl font-semibold text-foreground">
                  {totalCatalogValue.toLocaleString("en-US")}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    MKD
                  </span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/50">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Avg. Margin
                </p>
                <p className="font-display text-3xl font-semibold text-foreground">
                  {avgMargin.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">
                    %
                  </span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/50">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl mb-2">Your catalogue is empty</p>
          <p className="text-sm mb-6">Add your first product to get started</p>
          <Button onClick={openAdd} className="gap-2">
            <PackagePlus className="w-4 h-4" />
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${CATEGORY_COLORS[category] ?? ""}`}
                >
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground/60">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((product, idx) => {
                  const price = Number(product.basePrice);
                  const cost = Number(product.costPrice);
                  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                  const productId = String(product.id);
                  return (
                    <div
                      key={productId}
                      data-ocid={`products.item.${idx + 1}`}
                      className="bg-card border border-border/50 rounded-2xl p-5 shadow-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${CATEGORY_COLORS[normaliseCat(product.category)] ?? ""}`}
                        >
                          {normaliseCat(product.category)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            data-ocid={`products.edit_button.${idx + 1}`}
                            onClick={() => openEdit(product)}
                            title="Edit product"
                            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            data-ocid={`products.delete_button.${idx + 1}`}
                            onClick={() => setDeleteConfirmId(productId)}
                            title="Delete product"
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-display text-base font-semibold text-foreground mb-4 leading-snug">
                        {product.name}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                            Price
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {price.toLocaleString("en-US")} MKD
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                            Cost
                          </p>
                          <p className="text-sm font-semibold text-muted-foreground">
                            {cost.toLocaleString("en-US")} MKD
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="text-xs text-muted-foreground">
                          Margin
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            margin >= 50
                              ? "text-chart-3"
                              : margin >= 35
                                ? "text-chart-2"
                                : "text-destructive"
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
          }
        }}
      >
        <DialogContent
          className="w-full max-w-md flex flex-col max-h-[90dvh]"
          data-ocid="products.dialog"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-display text-2xl">
              {isEditing ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, category: v as ProductCategory }));
                }}
              >
                <SelectTrigger data-ocid="products.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-name">Product Name / Description</Label>
              <Input
                id="product-name"
                data-ocid="products.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Dark Chocolate Truffle Box"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Price (MKD)</Label>
                <Input
                  id="product-price"
                  data-ocid="products.price.input"
                  type="number"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basePrice: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-cost">Cost (MKD)</Label>
                <Input
                  id="product-cost"
                  data-ocid="products.cost.input"
                  type="number"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, costPrice: e.target.value }))
                  }
                />
              </div>
            </div>
            {Number(form.basePrice) > 0 && Number(form.costPrice) > 0 && (
              <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Profit margin: </span>
                <span className="font-semibold text-foreground">
                  {(
                    ((Number(form.basePrice) - Number(form.costPrice)) /
                      Number(form.basePrice)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0 pt-2">
            <Button
              variant="outline"
              data-ocid="products.cancel.button"
              onClick={() => {
                setDialogOpen(false);
                setEditingId(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              data-ocid="products.save.button"
              onClick={saveProduct}
              disabled={isPending || !form.name.trim()}
            >
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Product"}
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
        <DialogContent className="max-w-sm" data-ocid="products.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Delete Product?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This product will be removed from your catalogue. This action cannot
            be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="products.delete.cancel_button"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="products.delete.confirm_button"
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
