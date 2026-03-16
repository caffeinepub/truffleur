import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Client, Order } from "../backend.d";
import {
  useAddClient,
  useAddOrder,
  useGetAllClients,
  useGetAllProducts,
  useUpdateOrder,
} from "../hooks/useQueries";
import { getHiddenIds } from "../pages/Products";

// Category display order — handles both legacy singular and new plural names
const CATEGORY_ORDER = [
  "Truffles",
  "Truffle",
  "Flowers",
  "Flower",
  "Madeleines",
  "Madeleine",
  "Cake Pops",
  "Cake Pop",
  "Macarons",
  "Oreshki",
  "NYC Cookies",
  "Cakesicles",
  "Other",
];

let rowIdCounter = 0;

interface ProductRow {
  id: number;
  productName: string;
  quantity: string;
  unitPrice: number;
}

function makeRow(productName = "", quantity = "1", unitPrice = 0): ProductRow {
  return { id: ++rowIdCounter, productName, quantity, unitPrice };
}

function parseProductRows(raw: string): ProductRow[] {
  if (!raw) return [makeRow()];
  const parts = raw.split(", ");
  const rows = parts
    .map((part) => {
      const match = part.match(/^(.+) x(\d+)$/);
      if (match) return makeRow(match[1], match[2]);
      return makeRow(part, "1");
    })
    .filter((r) => r.productName);
  return rows.length > 0 ? rows : [makeRow()];
}

function encodeProductRows(rows: ProductRow[]): string {
  return rows
    .filter((r) => r.productName.trim())
    .map((r) => `${r.productName} x${r.quantity || "1"}`)
    .join(", ");
}

interface OrderFormProps {
  defaultClientName?: string;
  onSuccess?: () => void;
  editOrder?: Order;
}

// ── ProductCombobox ────────────────────────────────────────────────────────────
// Input with dropdown suggestion list — matches by includes (case-insensitive)
interface ProductComboboxProps {
  value: string;
  products: Array<{ id: number | bigint; name: string; category: string }>;
  onChange: (value: string) => void;
  onSelect: (productName: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
}

function ProductCombobox({
  value,
  products,
  onChange,
  onSelect,
  placeholder,
  "data-ocid": dataOcid,
}: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Sync external value changes (e.g., reset when product deleted)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter by includes, case-insensitive, max 8 results shown initially but list is scrollable
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return products.slice(0, 50);
    const q = inputValue.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [inputValue, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    onChange(v);
    setOpen(true);
    setActiveIndex(-1);
    // If cleared, reset price
    if (!v.trim()) {
      onSelect("");
    }
  };

  const handleSelect = (productName: string) => {
    setInputValue(productName);
    onSelect(productName);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex].name);
      } else if (e.key === "Enter") {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        data-ocid={dataOcid}
        placeholder={placeholder}
        value={inputValue}
        autoComplete="off"
        spellCheck={false}
        onChange={handleInputChange}
        onFocus={() => {
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-border rounded-md shadow-lg overflow-y-auto"
          style={{ maxHeight: "14rem" }}
          onMouseDown={(e) => e.preventDefault()} // keep input focus
        >
          {suggestions.map((p, idx) => (
            <button
              key={String(p.id)}
              type="button"
              aria-selected={idx === activeIndex}
              className={`w-full text-left px-3 py-2 text-sm cursor-pointer select-none flex items-center gap-2 transition-colors ${
                idx === activeIndex
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/60"
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={() => handleSelect(p.name)}
            >
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {p.category}
              </span>
              <span className="text-muted-foreground/40 shrink-0">•</span>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}
      {open && suggestions.length === 0 && inputValue.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-border rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No matching products
          </div>
        </div>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function OrderForm({
  defaultClientName = "",
  onSuccess,
  editOrder,
}: OrderFormProps) {
  const addOrder = useAddOrder();
  const updateOrder = useUpdateOrder();
  const addClient = useAddClient();
  const queryClient = useQueryClient();
  const { data: clients = [] } = useGetAllClients();
  const { data: allProducts = [] } = useGetAllProducts();
  const isEditing = !!editOrder;

  // Reactive hidden IDs — updates when products are deleted anywhere in the app
  const [hiddenIds, setHiddenIds] = useState<string[]>(getHiddenIds);

  useEffect(() => {
    const handler = () => setHiddenIds(getHiddenIds());
    window.addEventListener("truffleur-products-updated", handler);
    return () =>
      window.removeEventListener("truffleur-products-updated", handler);
  }, []);

  // Filter hidden products — memoised to avoid infinite re-render loop
  const products = useMemo(
    () => allProducts.filter((p) => !hiddenIds.includes(String(p.id))),
    [allProducts, hiddenIds],
  );

  const getInitialClientName = () => editOrder?.clientName ?? defaultClientName;
  const isExistingClient = (name: string) =>
    clients.some(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase() === name.toLowerCase(),
    );

  const [productRows, setProductRows] = useState<ProductRow[]>(() =>
    parseProductRows(editOrder?.productName ?? ""),
  );

  // Reset product rows when a product is deleted
  useEffect(() => {
    const validNames = new Set(products.map((p) => p.name));
    setProductRows((prev) => {
      let changed = false;
      const next = prev.map((row) => {
        if (!row.productName) return row;
        if (!validNames.has(row.productName)) {
          changed = true;
          return { ...row, productName: "", unitPrice: 0 };
        }
        return row;
      });
      return changed ? next : prev;
    });
  }, [products]);

  const [form, setForm] = useState({
    clientName: getInitialClientName(),
    occasion: editOrder?.occasion ?? "",
    deliveryDate: editOrder?.deliveryDate ?? "",
    deliveryAddress: editOrder?.isPickup
      ? ""
      : (editOrder?.deliveryAddress ?? ""),
    isPickup: editOrder?.isPickup ?? false,
    status: editOrder?.status ?? "New",
    notes: editOrder?.notes ?? "",
  });

  // Price: auto-calculated from products but manually editable
  const [priceManual, setPriceManual] = useState<string>("");
  const [priceEdited, setPriceEdited] = useState(false);

  const [useNewClient, setUseNewClient] = useState(() => {
    const name = getInitialClientName();
    if (!name) return false;
    return !isExistingClient(name);
  });

  const isPending = isEditing
    ? updateOrder.isPending
    : addOrder.isPending || addClient.isPending;

  // Products sorted by CATEGORY_ORDER then by name, deduplicated
  const sortedUniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return [...products]
      .sort((a, b) => {
        const catA = CATEGORY_ORDER.indexOf(a.category);
        const catB = CATEGORY_ORDER.indexOf(b.category);
        const catDiff = (catA === -1 ? 99 : catA) - (catB === -1 ? 99 : catB);
        if (catDiff !== 0) return catDiff;
        return a.name.localeCompare(b.name);
      })
      .filter((p) => {
        const key = p.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [products]);

  // Computed total from product rows
  const computedTotal = useMemo(() => {
    return productRows.reduce((sum, row) => {
      const qty = Number.parseInt(row.quantity) || 1;
      return sum + row.unitPrice * qty;
    }, 0);
  }, [productRows]);

  // Auto-fill price from products unless user has manually edited it
  useEffect(() => {
    if (!priceEdited) {
      setPriceManual(computedTotal > 0 ? String(computedTotal) : "");
    }
  }, [computedTotal, priceEdited]);

  // Effective price used when saving
  const effectivePrice = priceEdited ? Number(priceManual) || 0 : computedTotal;

  const addProductRow = () => {
    setProductRows((prev) => [...prev, makeRow()]);
  };

  const removeProductRow = (id: number) => {
    setProductRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateProductRow = (
    id: number,
    key: keyof Omit<ProductRow, "id">,
    val: string | number,
  ) => {
    setProductRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: val } : row)),
    );
  };

  const handleProductSelect = (rowId: number, productName: string) => {
    const found = products.find((p) => p.name === productName);
    const unitPrice = found ? Number(found.basePrice) : 0;
    setProductRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, productName, unitPrice } : row,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const encodedProducts = encodeProductRows(productRows);
    let matchedClient = clients.find(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase() ===
        form.clientName.toLowerCase(),
    );

    try {
      if (isEditing) {
        await updateOrder.mutateAsync({
          id: editOrder.id,
          clientId: matchedClient?.id ?? editOrder.clientId,
          clientName: form.clientName,
          productName: encodedProducts,
          quantity: BigInt(1),
          occasion: form.occasion,
          deliveryDate: form.deliveryDate,
          deliveryAddress: form.isPickup ? "Pickup" : form.deliveryAddress,
          isPickup: form.isPickup,
          price: BigInt(effectivePrice),
          deposit: BigInt(0),
          status: form.status,
          notes: form.notes,
        });
        toast.success("Order updated successfully");
      } else {
        let clientId = matchedClient?.id ?? 0n;
        if (!matchedClient && form.clientName.trim()) {
          const nameParts = form.clientName.trim().split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ") || "-";
          await addClient.mutateAsync({
            firstName,
            lastName,
            phone: "",
            instagram: "",
            email: "",
            clientType: "Regular",
            favoriteFlowers: "",
            favoriteTruffles: "",
            importantDates: "",
            notes: "",
            isVip: false,
          });
          await queryClient.refetchQueries({ queryKey: ["clients"] });
          const updatedClients =
            queryClient.getQueryData<Client[]>(["clients"]) ?? [];
          const newClient = updatedClients.find(
            (c) =>
              `${c.firstName} ${c.lastName}`.toLowerCase() ===
              form.clientName.toLowerCase(),
          );
          clientId = newClient?.id ?? 0n;
          toast.success(`New client "${form.clientName}" added to catalogue`);
        }

        await addOrder.mutateAsync({
          clientId,
          clientName: form.clientName,
          productName: encodedProducts,
          quantity: BigInt(1),
          occasion: form.occasion,
          deliveryDate: form.deliveryDate,
          deliveryAddress: form.isPickup ? "Pickup" : form.deliveryAddress,
          isPickup: form.isPickup,
          price: BigInt(effectivePrice),
          deposit: BigInt(0),
          status: form.status,
          notes: form.notes,
        });
        toast.success("Order added successfully");
      }
      onSuccess?.();
    } catch {
      toast.error(isEditing ? "Failed to update order" : "Failed to add order");
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client field */}
      {!useNewClient ? (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Client
          </Label>
          <Select
            value={form.clientName}
            onValueChange={(v) => {
              if (v === "__new__") {
                setUseNewClient(true);
                setForm((prev) => ({ ...prev, clientName: "" }));
              } else {
                setForm((prev) => ({ ...prev, clientName: v }));
              }
            }}
          >
            <SelectTrigger data-ocid="order_form.client.select">
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {clients.map((c) => (
                <SelectItem
                  key={String(c.id)}
                  value={`${c.firstName} ${c.lastName}`}
                >
                  {c.firstName} {c.lastName}
                </SelectItem>
              ))}
              <SelectItem value="__new__">+ New client...</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Client Name{" "}
            <button
              type="button"
              onClick={() => setUseNewClient(false)}
              className="text-xs text-primary underline ml-2 normal-case font-normal"
            >
              ← Back to list
            </button>
          </Label>
          <Input
            data-ocid="order_form.client_name.input"
            placeholder="Enter new client name..."
            required
            value={form.clientName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, clientName: e.target.value }))
            }
          />
          <p className="text-xs text-primary mt-1">
            New client — will be added to the catalogue automatically
          </p>
        </div>
      )}

      {/* Product rows — unlimited, combobox with dropdown suggestions */}
      <div className="space-y-2">
        <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Products
        </Label>
        {productRows.map((row, idx) => {
          const qty = Number.parseInt(row.quantity) || 1;
          const subtotal = row.unitPrice * qty;
          return (
            <div key={row.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0">
                  <ProductCombobox
                    data-ocid={`order_form.product_row.select.${idx + 1}`}
                    value={row.productName}
                    products={sortedUniqueProducts}
                    onChange={(v) => {
                      updateProductRow(row.id, "productName", v);
                      // Try to match exact product for price auto-fill as user types
                      const exact = products.find(
                        (p) => p.name.toLowerCase() === v.toLowerCase(),
                      );
                      if (exact) {
                        updateProductRow(
                          row.id,
                          "unitPrice",
                          Number(exact.basePrice),
                        );
                      } else if (!v.trim()) {
                        updateProductRow(row.id, "unitPrice", 0);
                      }
                    }}
                    onSelect={(v) => {
                      if (v) {
                        handleProductSelect(row.id, v);
                      } else {
                        updateProductRow(row.id, "productName", "");
                        updateProductRow(row.id, "unitPrice", 0);
                      }
                    }}
                    placeholder={
                      sortedUniqueProducts.length > 0
                        ? "Type to search products..."
                        : "Add products in catalogue first"
                    }
                  />
                </div>
                <div className="w-20 shrink-0">
                  <Input
                    data-ocid={`order_form.product_row.qty.${idx + 1}`}
                    type="number"
                    min="1"
                    placeholder="1"
                    value={row.quantity}
                    onChange={(e) =>
                      updateProductRow(row.id, "quantity", e.target.value)
                    }
                  />
                </div>
                {productRows.length > 1 && (
                  <button
                    type="button"
                    data-ocid={`order_form.product_row.remove_button.${idx + 1}`}
                    onClick={() => removeProductRow(row.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label="Remove product row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {row.productName && row.unitPrice > 0 && (
                <div className="text-right pr-1">
                  <span className="text-xs text-muted-foreground">
                    {row.unitPrice.toLocaleString("en-US")} × {qty} ={" "}
                    <span className="font-semibold text-foreground">
                      {subtotal.toLocaleString("en-US")} MKD
                    </span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="order_form.add_product_row.button"
          onClick={addProductRow}
          className="w-full mt-1 border-dashed text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add product
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Occasion */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Occasion
          </Label>
          <Select
            value={form.occasion || "__none__"}
            onValueChange={(v) =>
              setForm((prev) => ({
                ...prev,
                occasion: v === "__none__" ? "" : v,
              }))
            }
          >
            <SelectTrigger data-ocid="order_form.occasion.select">
              <SelectValue placeholder="Select occasion..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No occasion</SelectItem>
              <SelectItem value="Birthday">Birthday</SelectItem>
              <SelectItem value="Anniversary">Anniversary</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Valentine's Day">Valentine's Day</SelectItem>
              <SelectItem value="Christmas">Christmas</SelectItem>
              <SelectItem value="Mother's Day">Mother's Day</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Date & Time */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Date &amp; Time
          </Label>
          <Input
            data-ocid="order_form.delivery_date.input"
            type="datetime-local"
            {...field("deliveryDate")}
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Delivery Address
          </Label>
          <Label
            htmlFor="isPickup"
            className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer font-normal"
          >
            <Checkbox
              id="isPickup"
              checked={form.isPickup}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, isPickup: checked === true }))
              }
            />
            Pickup
          </Label>
        </div>
        <Input
          disabled={form.isPickup}
          placeholder={
            form.isPickup ? "Pickup from studio" : "Delivery address"
          }
          {...field("deliveryAddress")}
        />
      </div>

      {/* Price (MKD) — editable, auto-filled from products */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Price (MKD)
          </Label>
          <Input
            data-ocid="order_form.price.input"
            type="number"
            min="0"
            placeholder="Auto from products"
            value={priceManual}
            onChange={(e) => {
              setPriceManual(e.target.value);
              setPriceEdited(true);
            }}
          />
          {computedTotal > 0 && priceEdited && (
            <button
              type="button"
              className="text-[10px] text-primary underline"
              onClick={() => {
                setPriceEdited(false);
                setPriceManual(String(computedTotal));
              }}
            >
              Reset to auto ({computedTotal.toLocaleString("en-US")} MKD)
            </button>
          )}
        </div>
        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Status
          </Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["New", "In Progress", "Ready", "Delivered", "Cancelled"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Notes
        </Label>
        <Textarea
          placeholder="Special requests, card message..."
          rows={2}
          {...field("notes")}
        />
      </div>

      <Button
        type="submit"
        data-ocid="order_form.submit_button"
        disabled={isPending}
        className="w-full min-h-[44px]"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Saving..."}
          </>
        ) : isEditing ? (
          "Update Order"
        ) : (
          "Save Order"
        )}
      </Button>
    </form>
  );
}
