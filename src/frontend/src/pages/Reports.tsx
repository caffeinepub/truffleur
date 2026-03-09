import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useGetAllClients, useGetAllOrders } from "../hooks/useQueries";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_COLORS: Record<string, string> = {
  New: "oklch(0.65 0.12 240)",
  "In Progress": "oklch(0.72 0.12 72)",
  Ready: "oklch(0.65 0.13 155)",
  Delivered: "oklch(0.60 0.09 38)",
  Cancelled: "oklch(0.55 0.14 25)",
};

const barChartConfig: ChartConfig = {
  revenue: {
    label: "Revenue (MKD)",
    color: "oklch(0.68 0.11 22)",
  },
};

export default function Reports() {
  const { isLoading: loadingClients } = useGetAllClients();
  const { data: orders = [], isLoading: loadingOrders } = useGetAllOrders();
  const isLoading = loadingClients || loadingOrders;

  // Monthly revenue for last 6 months
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const result: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // month key unused
      const revenue = orders
        .filter((o) => {
          const ts = Number(o.createdAt) / 1_000_000;
          const od = new Date(ts);
          return (
            od.getFullYear() === d.getFullYear() &&
            od.getMonth() === d.getMonth() &&
            o.status === "Delivered"
          );
        })
        .reduce((s, o) => s + Number(o.price), 0);
      result.push({ month: MONTH_LABELS[d.getMonth()], revenue });
    }
    return result;
  }, [orders]);

  // Order status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Top 5 clients
  const topClients = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> =
      {};
    for (const o of orders) {
      const key = String(o.clientId);
      if (!map[key]) map[key] = { name: o.clientName, count: 0, total: 0 };
      map[key].count++;
      map[key].total += Number(o.price);
    }
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  // Best-selling products
  const bestProducts = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> =
      {};
    for (const o of orders) {
      const key = o.productName;
      if (!map[key]) map[key] = { name: key, count: 0, total: 0 };
      map[key].count += Number(o.quantity);
      map[key].total += Number(o.price);
    }
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const totalRevenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((s, o) => s + Number(o.price), 0);
  const avgOrderValue =
    orders.length > 0
      ? orders.reduce((s, o) => s + Number(o.price), 0) / orders.length
      : 0;
  const activeClients = new Set(orders.map((o) => String(o.clientId))).size;

  const summaryStats = [
    {
      label: "Total Revenue",
      value: `${totalRevenue.toLocaleString()} MKD`,
      icon: TrendingUp,
      color: "text-chart-1",
      bg: "bg-accent/50",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-chart-2",
      bg: "bg-secondary",
    },
    {
      label: "Avg. Order Value",
      value: `${Math.round(avgOrderValue).toLocaleString()} MKD`,
      icon: BarChart3,
      color: "text-chart-3",
      bg: "bg-secondary",
    },
    {
      label: "Active Clients",
      value: activeClients,
      icon: Users,
      color: "text-chart-5",
      bg: "bg-accent/50",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Analytics
        </p>
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
          Reports
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Business performance and insights
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="shadow-card border-border/50">
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
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Bar chart: monthly revenue */}
        <Card className="md:col-span-2 shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-medium text-foreground">
              Monthly Revenue
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Delivered orders – last 6 months
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton
                className="h-48 w-full"
                data-ocid="reports.revenue_chart.loading_state"
              />
            ) : (
              <ChartContainer config={barChartConfig} className="h-48">
                <BarChart
                  data={monthlyRevenue}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart: status distribution */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-medium text-foreground">
              Order Status
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution by status
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : statusDistribution.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            STATUS_COLORS[entry.name] || "oklch(0.70 0.05 46)"
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {statusDistribution.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              STATUS_COLORS[entry.name] ||
                              "oklch(0.70 0.05 46)",
                          }}
                        />
                        <span className="text-muted-foreground">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top clients */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-medium text-foreground">
              Top Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topClients.length === 0 ? (
              <div
                data-ocid="reports.top_clients.empty_state"
                className="p-8 text-center text-muted-foreground text-sm"
              >
                No data yet
              </div>
            ) : (
              <Table data-ocid="reports.top_clients.table">
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground pl-5">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground">
                      Client
                    </TableHead>
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground">
                      Orders
                    </TableHead>
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground text-right pr-5">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((c, idx) => (
                    <TableRow
                      key={c.name}
                      data-ocid={`reports.top_clients.row.${idx + 1}`}
                      className="border-border/30"
                    >
                      <TableCell className="text-xs text-muted-foreground pl-5">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.count}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground text-right pr-5">
                        {c.total.toLocaleString()} MKD
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Best products */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-medium text-foreground">
              Best-Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : bestProducts.length === 0 ? (
              <div
                data-ocid="reports.best_products.empty_state"
                className="p-8 text-center text-muted-foreground text-sm"
              >
                No data yet
              </div>
            ) : (
              <Table data-ocid="reports.best_products.table">
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground pl-5">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground">
                      Product
                    </TableHead>
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="text-xs font-medium tracking-wide text-muted-foreground text-right pr-5">
                      Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestProducts.map((p, idx) => (
                    <TableRow
                      key={p.name}
                      data-ocid={`reports.best_products.row.${idx + 1}`}
                      className="border-border/30"
                    >
                      <TableCell className="text-xs text-muted-foreground pl-5">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.count}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground text-right pr-5">
                        {p.total.toLocaleString()} MKD
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
