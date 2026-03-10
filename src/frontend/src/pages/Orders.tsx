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
import { Edit2, PackagePlus, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Order } from "../backend.d";
import OrderForm from "../components/OrderForm";
import { useGetAllOrders } from "../hooks/useQueries";
import { StatusBadge } from "./Dashboard";

const STATUSES = [
  "All",
  "New",
  "In Progress",
  "Ready",
  "Delivered",
  "Cancelled",
];

export default function Orders() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const [status, setStatus] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const { highlight } = useSearch({ from: "/orders" });
  const didScrollRef = useRef(false);

  // When orders load and a highlight param exists, scroll to and flash that order
  useEffect(() => {
    if (!highlight || isLoading || orders.length === 0 || didScrollRef.current)
      return;
    didScrollRef.current = true;

    // Switch to "All" so the order is visible
    setStatus("All");

    // Wait a tick for the DOM to render
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

  const filtered =
    status === "All" ? orders : orders.filter((o) => o.status === status);

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
      </header>

      {/* Status filter tabs — horizontal scroll on mobile */}
      <Tabs value={status} onValueChange={setStatus} className="mb-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 h-auto p-1 flex flex-nowrap gap-1 w-max min-w-full">
            {STATUSES.map((s) => (
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

      {/* Order list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No orders found</p>
          <p className="text-sm mt-1">
            {status === "All"
              ? "Add your first order to get started"
              : `No orders with status "${status}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order, idx) => (
            <div
              key={String(order.id)}
              data-ocid={`orders.item.${idx + 1}`}
              data-order-id={String(order.id)}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-card transition-all duration-200"
            >
              {/* Order number */}
              <div className="shrink-0">
                <span className="font-mono text-sm font-semibold text-muted-foreground">
                  #{String(order.id).padStart(3, "0")}
                </span>
              </div>

              {/* Client + Product */}
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

              {/* Date + Price + Status + Edit row on mobile */}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-ocid="orders.edit_order.button"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => setEditOrder(order)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {filtered.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </span>
          <span className="font-medium text-foreground">
            Total:{" "}
            {filtered.reduce((s, o) => s + Number(o.price), 0).toLocaleString()}{" "}
            MKD
          </span>
        </div>
      )}
    </div>
  );
}
