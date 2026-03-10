import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  Crown,
  LayoutGrid,
  PackagePlus,
  ShoppingBag,
  TrendingUp,
  Truck,
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
      todayDeliveries: orders.filter((o) => o.deliveryDate === today).length,
      vipClients: clients.filter((c) => c.isVip).length,
      weeklySales: orders
        .filter((o) => {
          if (o.status !== "Delivered") return false;
          const ts = Number(o.createdAt) / 1_000_000;
          return new Date(ts) >= weekAgo;
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
      color: "text-primary",
      bg: "bg-accent/50",
    },
    {
      label: "Active Orders",
      value: stats.activeOrders,
      icon: ShoppingBag,
      color: "text-chart-2",
      bg: "bg-secondary",
    },
    {
      label: "Today's Deliveries",
      value: stats.todayDeliveries,
      icon: Truck,
      color: "text-chart-3",
      bg: "bg-secondary",
    },
    {
      label: "VIP Clients",
      value: stats.vipClients,
      icon: Crown,
      color: "text-chart-5",
      bg: "bg-accent/50",
    },
    {
      label: "Weekly Sales",
      value: `${stats.weeklySales.toLocaleString()} MKD`,
      icon: TrendingUp,
      color: "text-chart-1",
      bg: "bg-accent/50",
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
      label: "Today's Deliveries",
      icon: Truck,
      ocid: "dashboard.deliveries.button",
      onClick: () =>
        navigate({ to: "/orders", search: { highlight: undefined } }),
    },
    {
      label: "VIP Clients",
      icon: Crown,
      ocid: "dashboard.vip.button",
      onClick: () => navigate({ to: "/vip" }),
    },
    {
      label: "Products",
      icon: LayoutGrid,
      ocid: "dashboard.products.button",
      onClick: () => navigate({ to: "/products" }),
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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Good {getGreeting()}
        </p>
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
          Business Overview
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Signature Truffles Feature Card — vivid lavender & green */}
      <section className="mb-10" data-ocid="dashboard.truffles.card">
        <div
          className="relative overflow-hidden rounded-2xl shadow-elevated"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.14 148) 0%, oklch(0.38 0.16 148) 30%, oklch(0.55 0.18 290) 65%, oklch(0.45 0.20 290) 100%)",
            minHeight: "220px",
          }}
        >
          {/* Decorative blurred blobs */}
          <div
            className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: "oklch(0.55 0.20 148 / 0.45)",
              filter: "blur(48px)",
            }}
          />
          <div
            className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "oklch(0.72 0.22 290 / 0.50)",
              filter: "blur(56px)",
            }}
          />
          {/* Extra inner glow for richness */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 60% 40%, oklch(0.68 0.18 290 / 0.25) 0%, transparent 55%)",
            }}
          />

          <div className="relative flex flex-col md:flex-row items-stretch">
            {/* Button side */}
            <div
              className="flex-1 flex items-center justify-center md:justify-start p-8 md:p-12"
              style={{ minHeight: "180px" }}
            >
              <Button
                size="default"
                data-ocid="dashboard.truffles.button"
                onClick={() => navigate({ to: "/products" })}
                className="font-semibold tracking-wide text-white shadow-lg transition-all duration-200"
                style={{
                  background: "oklch(0.65 0.22 290)",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.72 0.22 290)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.65 0.22 290)";
                }}
              >
                View Products
              </Button>
            </div>

            {/* Image side */}
            <div className="relative md:w-72 lg:w-80 h-52 md:h-auto flex-shrink-0 overflow-hidden">
              <img
                src="/assets/generated/truffle-chocolates.dim_600x400.jpg"
                alt="Signature chocolate truffles"
                className="w-full h-full object-cover"
                style={{
                  minHeight: "200px",
                  opacity: 0.55,
                  mixBlendMode: "luminosity",
                }}
              />
              {/* Strong left-edge fade into banner gradient */}
              <div
                className="hidden md:block absolute inset-y-0 left-0 w-24"
                style={{
                  background:
                    "linear-gradient(to right, oklch(0.55 0.18 290), transparent)",
                }}
              />
              {/* Top + bottom subtle fade */}
              <div
                className="absolute inset-x-0 top-0 h-10"
                style={{
                  background:
                    "linear-gradient(to bottom, oklch(0.38 0.16 148 / 0.6), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-10">
        <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-5">
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
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="font-display text-3xl font-semibold text-foreground">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              type="button"
              key={action.label}
              data-ocid={action.ocid}
              onClick={action.onClick}
              className="relative group flex flex-col items-start gap-3 p-5 rounded-xl border transition-all duration-200 text-left border-primary/30 bg-accent/30 hover:bg-accent/60 hover:border-primary/50 hover:shadow-card cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-primary/15">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Orders Preview */}
      {orders.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Recent Orders
            </h2>
            <button
              type="button"
              onClick={() =>
                navigate({ to: "/orders", search: { highlight: undefined } })
              }
              className="text-xs text-primary hover:text-primary/70 font-medium transition-colors"
            >
              View all →
            </button>
          </div>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={String(order.id)}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{String(order.id).padStart(3, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.productName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {Number(order.price).toLocaleString()} MKD
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: "bg-blue-50 text-blue-700 border-blue-100",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-100",
    Ready: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Delivered: "bg-secondary text-secondary-foreground border-border",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        map[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}
