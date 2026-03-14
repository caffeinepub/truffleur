import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CalendarDays,
  PackagePlus,
  Receipt,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useGetAllClients, useGetAllOrders } from "../hooks/useQueries";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    Ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Delivered: "bg-slate-100 text-slate-600 border-slate-200",
    Cancelled: "bg-red-100 text-red-600 border-red-200",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
        styles[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading: loadingClients } = useGetAllClients();
  const { data: orders = [], isLoading: loadingOrders } = useGetAllOrders();

  const stats = useMemo(() => {
    const today = todayString();
    const weekAgo = sevenDaysAgo();
    return {
      totalClients: clients.length,
      activeOrders: orders.filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled",
      ).length,
      weeklySales: orders
        .filter((o) => {
          if (o.status !== "Delivered") return false;
          const ts = Number(o.createdAt) / 1_000_000;
          return new Date(ts) >= weekAgo;
        })
        .reduce((sum, o) => sum + Number(o.price), 0),
      dailySales: orders
        .filter((o) => {
          return o.status === "Delivered" && o.deliveryDate === today;
        })
        .reduce((sum, o) => sum + Number(o.price), 0),
    };
  }, [clients, orders]);

  const isLoading = loadingClients || loadingOrders;

  const statCards = [
    {
      label: "Total Clients",
      value: stats.totalClients,
      icon: Users,
    },
    {
      label: "Active Orders",
      value: stats.activeOrders,
      icon: ShoppingBag,
    },
    {
      label: "Weekly Sales",
      value: `${stats.weeklySales.toLocaleString()} MKD`,
      icon: TrendingUp,
      wide: true,
    },
    {
      label: "Daily Sales",
      value: `${stats.dailySales.toLocaleString()} MKD`,
      icon: TrendingUp,
      wide: true,
    },
  ];

  const quickActions = [
    {
      label: "Add Client",
      icon: UserPlus,
      ocid: "dashboard.add_client.button",
      onClick: () => navigate({ to: "/clients", search: { action: "add" } }),
    },
    {
      label: "Add Order",
      icon: PackagePlus,
      ocid: "dashboard.add_order.button",
      onClick: () =>
        navigate({ to: "/orders", search: { highlight: undefined } }),
    },
    {
      label: "Expenses",
      icon: Receipt,
      ocid: "dashboard.expenses.button",
      onClick: () => navigate({ to: "/expenses" }),
    },
    {
      label: "Suppliers",
      icon: Building2,
      ocid: "dashboard.suppliers.button",
      onClick: () => navigate({ to: "/suppliers" }),
    },
    {
      label: "Calendar",
      icon: CalendarDays,
      ocid: "dashboard.calendar.button",
      onClick: () => navigate({ to: "/calendar" }),
    },
    {
      label: "Reports",
      icon: BarChart3,
      ocid: "dashboard.reports.button",
      onClick: () => navigate({ to: "/reports" }),
    },
  ];

  const upcomingOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    return orders
      .filter((o) => {
        if (o.status === "Delivered" || o.status === "Cancelled") return false;
        if (!o.deliveryDate) return false;
        const d = new Date(o.deliveryDate);
        return d >= today && d <= in7;
      })
      .sort((a, b) => {
        const da = new Date(a.deliveryDate ?? "").getTime();
        const db = new Date(b.deliveryDate ?? "").getTime();
        return da - db;
      })
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Banner — full picture with text overlays only */}
      <section className="mb-10" data-ocid="dashboard.truffles.card">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            minHeight: "200px",
            backgroundImage:
              "url('/assets/generated/banner-picnic-joy-v2.dim_1400x500.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Top overlay row: logo image left, date right */}
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-5 pt-4 pointer-events-none">
            {/* Logo image — top left, small, no background */}
            <img
              src="/assets/uploads/att.KUB7gyQDFib3dqzTfOpT5myxSD_GYh1blowOo8AVQ2A-1.jpeg"
              alt="Truffleur"
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />

            {/* Date — top right, same style as View Products */}
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(0.65rem, 1.8vw, 0.85rem)",
                letterSpacing: "0.08em",
                color: "rgba(255, 252, 230, 0.97)",
                textShadow:
                  "0 1px 8px rgba(0,0,0,0.7), 0 0px 3px rgba(0,0,0,0.6)",
                textAlign: "right",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* View Products button centered */}
          <div className="relative flex items-center justify-center py-16">
            <button
              type="button"
              data-ocid="dashboard.truffles.button"
              onClick={() => navigate({ to: "/products" })}
              className="transition-all duration-200 hover:scale-105 pointer-events-auto"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "1.15rem",
                letterSpacing: "0.2em",
                color: "rgba(255, 252, 220, 0.98)",
                background: "transparent",
                border: "none",
                padding: "0",
                cursor: "pointer",
                textShadow:
                  "0 2px 10px rgba(0,0,0,0.55), 0 0px 2px rgba(0,0,0,0.6)",
              }}
            >
              View Products
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-10">
        <h2 className="font-display text-sm font-medium tracking-widest uppercase text-foreground/60 mb-5">
          At a Glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              className={`shadow-card border-border/50 ${
                stat.wide ? "col-span-2 md:col-span-4" : ""
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                      {stat.label}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="font-display text-2xl font-semibold text-foreground">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg bg-accent/50">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="font-display text-sm font-medium tracking-widest uppercase text-foreground/60 mb-5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              data-ocid={action.ocid}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-200 text-center group min-h-[88px] justify-center"
            >
              <div className="p-2.5 rounded-lg bg-accent/50 group-hover:bg-primary/10 transition-colors">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground/80 leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Upcoming This Week */}
      <section>
        <h2 className="font-display text-sm font-medium tracking-widest uppercase text-foreground/60 mb-5">
          Upcoming This Week
        </h2>
        {upcomingOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No deliveries in the next 7 days.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingOrders.map((order) => (
              <button
                key={String(order.id)}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/orders",
                    search: { highlight: String(order.id) },
                  })
                }
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-chart-3/30 hover:shadow-card transition-all text-left"
              >
                {/* Green date box on the left */}
                <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-chart-3 leading-none uppercase">
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString(
                          "en-GB",
                          { month: "short" },
                        )
                      : ""}
                  </span>
                  <span className="font-display text-base font-bold text-chart-3 leading-none">
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).getDate()
                      : "—"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {order.clientName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.productName}
                  </p>
                </div>
                <div className="shrink-0 text-sm font-semibold text-foreground">
                  {Number(order.price).toLocaleString()} MKD
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
