import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@tanstack/react-router";
import {
  Download,
  Edit2,
  History,
  PackagePlus,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Order } from "../backend.d";
import OrderForm from "../components/OrderForm";
import { useGetAllOrders } from "../hooks/useQueries";
import { StatusBadge } from "./Dashboard";

const ACTIVE_STATUSES = ["New", "In Progress", "Ready"];
const HISTORY_STATUSES = ["Delivered", "Cancelled"];

const FILTER_STATUSES = ["All", "New", "In Progress", "Ready"];

function exportOrdersToCSV(orders: Order[]) {
  const headers = [
    "Order #",
    "Client",
    "Product",
    "Qty",
    "Occasion",
    "Delivery Date",
    "Address",
    "Price (MKD)",
    "Deposit (MKD)",
    "Status",
    "Notes",
  ];

  const csvEscape = (val: string | number | bigint | undefined | null) => {
    const str = val == null ? "" : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = orders.map((o) => [
    csvEscape(String(o.id).padStart(3, "0")),
    csvEscape(o.clientName),
    csvEscape(o.productName),
    csvEscape(Number(o.quantity)),
    csvEscape(o.occasion ?? ""),
    csvEscape(o.deliveryDate ?? ""),
    csvEscape(o.deliveryAddress ?? ""),
    csvEscape(Number(o.price)),
    csvEscape(Number(o.deposit ?? 0)),
    csvEscape(o.status),
    csvEscape(o.notes ?? ""),
  ]);

  const csv = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `truffleur-orders-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function OrderRow({
  order,
  idx,
  onEdit,
  clickable,
}: {
  order: Order;
  idx: number;
  onEdit?: (o: Order) => void;
  clickable?: boolean;
}) {
  return (
    <div
      key={String(order.id)}
      data-ocid={`orders.item.${idx + 1}`}
      data-order-id={String(order.id)}
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-card transition-all duration-200"
    >
      <div className="shrink-0">
        <span className="font-mono text-sm font-semibold text-muted-foreground">
          #{String(order.id).padStart(3, "0")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {order.clientName}
          </p>
          {order.occasion && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {order.occasion}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {order.productName}
          {order.quantity > 1n ? ` × ${order.quantity}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:contents">
        <div className="shrink-0 text-xs text-muted-foreground">
          {order.deliveryDate || "—"}
        </div>
        <div className="shrink-0 text-sm font-semibold text-foreground">
          {Number(order.price).toLocaleString()} MKD
        </div>
        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="orders.edit_order.button"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onEdit(order)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
        {clickable && !onEdit && <div className="shrink-0 h-8 w-8" />}
      </div>
    </div>
  );
}

export default function Orders() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const [status, setStatus] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const { highlight } = useSearch({ from: "/orders" });
  const didScrollRef = useRef(false);

  useEffect(() => {
    if (!highlight || isLoading || orders.length === 0 || didScrollRef.current)
      return;
    didScrollRef.current = true;
    setStatus("All");
    setTimeout(() => {
      const el = document.querySelector(
        `[data-order-id="${highlight}"]`,
      ) as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("order-highlight");
      setTimeout(() => el.classList.remove("order-highlight"), 2500);
    }, 150);
  }, [highlight, isLoading, orders]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) =>
    HISTORY_STATUSES.includes(o.status),
  );

  // Sort active orders by delivery date (ascending — soonest first)
  const sortedActive = [...activeOrders].sort((a, b) => {
    if (!a.deliveryDate && !b.deliveryDate) return 0;
    if (!a.deliveryDate) return 1;
    if (!b.deliveryDate) return -1;
    return a.deliveryDate.localeCompare(b.deliveryDate);
  });

  // Sort history orders by delivery date (descending — most recent first)
  const sortedHistory = [...historyOrders].sort((a, b) => {
    if (!a.deliveryDate && !b.deliveryDate) return 0;
    if (!a.deliveryDate) return 1;
    if (!b.deliveryDate) return -1;
    return b.deliveryDate.localeCompare(a.deliveryDate);
  });

  const filteredActive =
    status === "All"
      ? sortedActive
      : sortedActive.filter((o) => o.status === status);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            Operations
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Orders
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="orders.export_csv.button"
            variant="outline"
            className="gap-2 min-h-[44px]"
            disabled={isLoading || orders.length === 0}
            onClick={() => exportOrdersToCSV(orders)}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="orders.add_order.button"
                className="gap-2 min-h-[44px]"
              >
                <PackagePlus className="w-4 h-4" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90dvh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  New Order
                </DialogTitle>
              </DialogHeader>
              <div
                className="overflow-y-auto flex-1 pr-1"
                style={{ maxHeight: "calc(90dvh - 80px)" }}
              >
                <div className="pb-4">
                  <OrderForm onSuccess={() => setAddOpen(false)} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Status filter tabs — active only */}
      <Tabs value={status} onValueChange={setStatus} className="mb-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 h-auto p-1 flex flex-nowrap gap-1 w-max min-w-full">
            {FILTER_STATUSES.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                data-ocid="orders.status_filter.tab"
                className="text-xs tracking-wide whitespace-nowrap data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Edit Order Dialog */}
      <Dialog
        open={!!editOrder}
        onOpenChange={(open) => {
          if (!open) setEditOrder(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Edit Order
            </DialogTitle>
          </DialogHeader>
          <div
            className="overflow-y-auto flex-1 pr-1"
            style={{ maxHeight: "calc(90dvh - 80px)" }}
          >
            <div className="pb-4">
              {editOrder && (
                <OrderForm
                  editOrder={editOrder}
                  onSuccess={() => setEditOrder(null)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active order list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredActive.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No active orders</p>
          <p className="text-sm mt-1">
            {status === "All"
              ? "All orders have been completed or add a new one"
              : `No orders with status "${status}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActive.map((order, idx) => (
            <OrderRow
              key={String(order.id)}
              order={order}
              idx={idx}
              onEdit={setEditOrder}
            />
          ))}
        </div>
      )}

      {/* Summary footer for active */}
      {filteredActive.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredActive.length} order
            {filteredActive.length !== 1 ? "s" : ""}
          </span>
          <span className="font-medium text-foreground">
            Total:{" "}
            {filteredActive
              .reduce((s, o) => s + Number(o.price), 0)
              .toLocaleString()}{" "}
            MKD
          </span>
        </div>
      )}

      {/* Order History Section */}
      {sortedHistory.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-5">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Order History
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {sortedHistory.length}
            </span>
          </div>
          <div className="space-y-2">
            {sortedHistory.map((order, idx) => (
              <button
                type="button"
                key={String(order.id)}
                data-ocid={`orders.history.item.${idx + 1}`}
                data-order-id={String(order.id)}
                onClick={() => setEditOrder(order)}
                className="w-full text-left flex flex-col sm:flex-row sm:items-center gap-3 p-5 rounded-xl bg-card/60 border border-border/30 hover:border-primary/20 hover:shadow-card transition-all duration-200 opacity-80 hover:opacity-100"
              >
                <div className="shrink-0">
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    #{String(order.id).padStart(3, "0")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {order.clientName}
                    </p>
                    {order.occasion && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {order.occasion}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.productName}
                    {order.quantity > 1n ? ` × ${order.quantity}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:contents">
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {order.deliveryDate || "—"}
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-foreground">
                    {Number(order.price).toLocaleString()} MKD
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {sortedHistory.length} completed order
              {sortedHistory.length !== 1 ? "s" : ""}
            </span>
            <span className="font-medium text-foreground">
              Total:{" "}
              {sortedHistory
                .reduce((s, o) => s + Number(o.price), 0)
                .toLocaleString()}{" "}
              MKD
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
