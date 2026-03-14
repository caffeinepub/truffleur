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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Client, Order } from "../backend.d";
import {
  useAddClient,
  useAddOrder,
  useGetAllClients,
  useGetAllProducts,
  useUpdateOrder,
} from "../hooks/useQueries";

let rowIdCounter = 0;

interface ProductRow {
  id: number;
  productName: string;
  quantity: string;
}

function makeRow(productName = "", quantity = "1"): ProductRow {
  return { id: ++rowIdCounter, productName, quantity };
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
  // Always fetch live products from backend — auto-updates when new products are added
  const { data: products = [] } = useGetAllProducts();
  const isEditing = !!editOrder;

  const getInitialClientName = () => editOrder?.clientName ?? defaultClientName;
  const isExistingClient = (name: string) =>
    clients.some(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase() === name.toLowerCase(),
    );

  const [productRows, setProductRows] = useState<ProductRow[]>(() =>
    parseProductRows(editOrder?.productName ?? ""),
  );

  const [form, setForm] = useState({
    clientName: getInitialClientName(),
    occasion: editOrder?.occasion ?? "",
    deliveryDate: editOrder?.deliveryDate ?? "",
    deliveryAddress: editOrder?.isPickup
      ? ""
      : (editOrder?.deliveryAddress ?? ""),
    isPickup: editOrder?.isPickup ?? false,
    price: editOrder ? String(editOrder.price) : "",
    deposit: editOrder ? String(editOrder.deposit) : "",
    status: editOrder?.status ?? "New",
    notes: editOrder?.notes ?? "",
  });

  const [useNewClient, setUseNewClient] = useState(() => {
    const name = getInitialClientName();
    if (!name) return false;
    return !isExistingClient(name);
  });

  const isPending = isEditing
    ? updateOrder.isPending
    : addOrder.isPending || addClient.isPending;

  const addProductRow = () => {
    if (productRows.length >= 5) return;
    setProductRows((prev) => [...prev, makeRow()]);
  };

  const removeProductRow = (id: number) => {
    setProductRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateProductRow = (
    id: number,
    key: keyof Omit<ProductRow, "id">,
    val: string,
  ) => {
    setProductRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: val } : row)),
    );
  };

  const sortedUniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return [...products]
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
      )
      .filter((p) => {
        const key = p.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [products]);

  const handleProductSelect = (rowId: number, productName: string) => {
    updateProductRow(rowId, "productName", productName);
    if (productRows.length === 1) {
      const found = products.find((p) => p.name === productName);
      if (found && !form.price) {
        setForm((prev) => ({ ...prev, price: String(found.basePrice) }));
      }
    }
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
          price: BigInt(form.price || "0"),
          deposit: BigInt(form.deposit || "0"),
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
          price: BigInt(form.price || "0"),
          deposit: BigInt(form.deposit || "0"),
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
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Product rows — live from backend, scrollable dropdown */}
      <div className="space-y-2">
        <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Products
        </Label>
        {productRows.map((row, idx) => (
          <div key={row.id} className="flex gap-2 items-center">
            <div className="flex-1">
              {products.length > 0 ? (
                <Select
                  value={row.productName}
                  onValueChange={(v) => handleProductSelect(row.id, v)}
                >
                  <SelectTrigger
                    data-ocid={`order_form.product_row.select.${idx + 1}`}
                  >
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  {/* max-h + overflow ensures scrollability for long product lists */}
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {sortedUniqueProducts.map((p) => (
                      <SelectItem key={String(p.id)} value={p.name}>
                        <span className="text-xs text-muted-foreground mr-1.5">
                          [{p.category}]
                        </span>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  data-ocid={`order_form.product_row.select.${idx + 1}`}
                  placeholder="Product name (add products in catalogue first)"
                  value={row.productName}
                  onChange={(e) =>
                    updateProductRow(row.id, "productName", e.target.value)
                  }
                />
              )}
            </div>
            <div className="w-20">
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
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove product row"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {productRows.length < 5 && (
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
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Occasion dropdown */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Price (MKD)
          </Label>
          <Input
            data-ocid="order_form.price.input"
            type="number"
            min="0"
            placeholder="1850"
            required
            {...field("price")}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Deposit (MKD)
          </Label>
          <Input
            type="number"
            min="0"
            placeholder="500"
            {...field("deposit")}
          />
        </div>
      </div>

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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Notes
        </Label>
        <Textarea
          placeholder="Special requests, card message..."
          rows={3}
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
