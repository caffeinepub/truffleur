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
  Edit2,
  LayoutGrid,
  PackagePlus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

type ProductCategory = "Truffles" | "Flowers" | "Gift Boxes" | "Seasonal";

interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
}

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Truffles: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Flowers: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Gift Boxes": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Seasonal: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Black Truffle Box (50g)",
    category: "Truffles",
    price: 3500,
    cost: 1800,
    stock: 12,
  },
  {
    id: 2,
    name: "White Truffle Slices (30g)",
    category: "Truffles",
    price: 2800,
    cost: 1400,
    stock: 8,
  },
  {
    id: 3,
    name: "Truffle Honey Jar",
    category: "Truffles",
    price: 1200,
    cost: 500,
    stock: 25,
  },
  {
    id: 4,
    name: "Peony Bouquet (12 stems)",
    category: "Flowers",
    price: 2200,
    cost: 900,
    stock: 6,
  },
  {
    id: 5,
    name: "Rose Collection (24 stems)",
    category: "Flowers",
    price: 3200,
    cost: 1100,
    stock: 4,
  },
  {
    id: 6,
    name: "Orchid Arrangement",
    category: "Flowers",
    price: 4500,
    cost: 1800,
    stock: 3,
  },
  {
    id: 7,
    name: "Luxury Gift Box — Classic",
    category: "Gift Boxes",
    price: 5500,
    cost: 2200,
    stock: 10,
  },
  {
    id: 8,
    name: "Truffle & Flowers Premium Set",
    category: "Gift Boxes",
    price: 8900,
    cost: 3500,
    stock: 7,
  },
  {
    id: 9,
    name: "Valentine's Rose Box",
    category: "Seasonal",
    price: 4200,
    cost: 1700,
    stock: 15,
  },
  {
    id: 10,
    name: "Mother's Day Hamper",
    category: "Seasonal",
    price: 6800,
    cost: 2800,
    stock: 20,
  },
];

const EMPTY_FORM: Omit<Product, "id"> = {
  name: "",
  category: "Truffles",
  price: 0,
  cost: 0,
  stock: 0,
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalCatalogValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const avgMargin =
    products.length > 0
      ? products.reduce((s, p) => s + ((p.price - p.cost) / p.price) * 100, 0) /
        products.length
      : 0;

  function openAdd() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
    });
    setDialogOpen(true);
  }

  function saveProduct() {
    if (!form.name.trim()) return;
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...editingProduct, ...form } : p,
        ),
      );
    } else {
      const newId = Math.max(0, ...products.map((p) => p.id)) + 1;
      setProducts((prev) => [...prev, { id: newId, ...form }]);
    }
    setDialogOpen(false);
  }

  function confirmDelete() {
    if (deleteId !== null) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  }

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
        <Button
          data-ocid="products.add_product.button"
          className="gap-2"
          onClick={openAdd}
        >
          <PackagePlus className="w-4 h-4" />
          Add Product
        </Button>
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
                  {totalCatalogValue.toLocaleString()}{" "}
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
              <div className="p-2.5 rounded-lg bg-secondary">
                <TrendingUp className="w-5 h-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl mb-1">No products yet</p>
          <p className="text-sm">
            Add your first product to build your catalogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, idx) => {
            const margin =
              ((product.price - product.cost) / product.price) * 100;
            return (
              <div
                key={product.id}
                data-ocid={`products.item.${idx + 1}`}
                className="group bg-card border border-border/50 hover:border-primary/30 hover:shadow-card rounded-xl p-5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${CATEGORY_COLORS[product.category]}`}
                  >
                    {product.category}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      data-ocid={`products.edit_button.${idx + 1}`}
                      onClick={() => openEdit(product)}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`products.delete_button.${idx + 1}`}
                      onClick={() => setDeleteId(product.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-4 leading-snug">
                  {product.name}
                </h3>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Price
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {product.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Cost
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {product.cost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Stock
                    </p>
                    <p
                      className={`text-sm font-semibold ${product.stock <= 3 ? "text-destructive" : "text-foreground"}`}
                    >
                      {product.stock}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Margin</span>
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
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="products.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                data-ocid="products.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Black Truffle Box (50g)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ProductCategory }))
                }
              >
                <SelectTrigger data-ocid="products.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Truffles",
                      "Flowers",
                      "Gift Boxes",
                      "Seasonal",
                    ] as ProductCategory[]
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Price (MKD)</Label>
                <Input
                  id="product-price"
                  data-ocid="products.price.input"
                  type="number"
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-cost">Cost (MKD)</Label>
                <Input
                  id="product-cost"
                  data-ocid="products.cost.input"
                  type="number"
                  value={form.cost || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cost: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  data-ocid="products.stock.input"
                  type="number"
                  value={form.stock || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            {form.price > 0 && form.cost > 0 && (
              <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Profit margin: </span>
                <span className="font-semibold text-foreground">
                  {(((form.price - form.cost) / form.price) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="products.cancel.button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button data-ocid="products.save.button" onClick={saveProduct}>
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="products.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Delete Product?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the product from your catalogue. This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="products.delete.cancel_button"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="products.delete.confirm_button"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
