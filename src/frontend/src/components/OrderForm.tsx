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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddOrder, useGetAllClients } from "../hooks/useQueries";

interface OrderFormProps {
  defaultClientName?: string;
  onSuccess?: () => void;
}

export default function OrderForm({
  defaultClientName = "",
  onSuccess,
}: OrderFormProps) {
  const addOrder = useAddOrder();
  const { data: clients = [] } = useGetAllClients();

  const [form, setForm] = useState({
    clientName: defaultClientName,
    productName: "",
    quantity: "1",
    occasion: "",
    deliveryDate: "",
    deliveryAddress: "",
    isPickup: false,
    price: "",
    deposit: "",
    status: "New",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClient = clients.find(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase() ===
        form.clientName.toLowerCase(),
    );
    try {
      await addOrder.mutateAsync({
        clientId: matchedClient?.id ?? 0n,
        clientName: form.clientName,
        productName: form.productName,
        quantity: BigInt(form.quantity || "1"),
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
      onSuccess?.();
    } catch {
      toast.error("Failed to add order");
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Client Name
        </Label>
        <Input
          data-ocid="order_form.client_name.input"
          placeholder="Search client name..."
          list="clients-list"
          required
          {...field("clientName")}
        />
        <datalist id="clients-list">
          {clients.map((c) => (
            <option key={String(c.id)} value={`${c.firstName} ${c.lastName}`} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Product
          </Label>
          <Input
            data-ocid="order_form.product_name.input"
            placeholder="Luxury Truffle Box"
            required
            list="products-list"
            {...field("productName")}
          />
          <datalist id="products-list">
            <option value="Flower Cone + 5 Truffles" />
            <option value="Lavender Truffle Box" />
            <option value="Rose Luxury Box" />
            <option value="Corporate Gift Set" />
            <option value="Seasonal Collection" />
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Quantity
          </Label>
          <Input type="number" min="1" placeholder="1" {...field("quantity")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Occasion
          </Label>
          <Input
            placeholder="Birthday, Anniversary..."
            list="occasions-list"
            {...field("occasion")}
          />
          <datalist id="occasions-list">
            <option value="Birthday" />
            <option value="Anniversary" />
            <option value="Corporate" />
            <option value="Wedding" />
            <option value="Valentine's Day" />
            <option value="Christmas" />
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Delivery Date
          </Label>
          <Input type="date" {...field("deliveryDate")} />
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
        disabled={addOrder.isPending}
        className="w-full min-h-[44px]"
      >
        {addOrder.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Order"
        )}
      </Button>
    </form>
  );
}
