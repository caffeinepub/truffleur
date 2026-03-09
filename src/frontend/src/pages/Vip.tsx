import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useGetAllClients, useGetAllOrders } from "../hooks/useQueries";

const VIP_THRESHOLD = 50000;

export default function Vip() {
  const { data: clients = [], isLoading: loadingClients } = useGetAllClients();
  const { data: orders = [], isLoading: loadingOrders } = useGetAllOrders();

  const isLoading = loadingClients || loadingOrders;

  const vipData = useMemo(() => {
    const vipClients = clients.filter((c) => c.isVip);
    return vipClients
      .map((client) => {
        const clientOrders = orders.filter((o) => o.clientId === client.id);
        const totalSpend = clientOrders.reduce(
          (sum, o) => sum + Number(o.price),
          0,
        );
        const isAutoVip = totalSpend >= VIP_THRESHOLD;
        return { client, clientOrders, totalSpend, isAutoVip };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [clients, orders]);

  const allHighSpenders = useMemo(() => {
    return clients
      .filter((c) => !c.isVip)
      .map((client) => {
        const clientOrders = orders.filter((o) => o.clientId === client.id);
        const totalSpend = clientOrders.reduce(
          (sum, o) => sum + Number(o.price),
          0,
        );
        return { client, totalSpend };
      })
      .filter((c) => c.totalSpend >= VIP_THRESHOLD);
  }, [clients, orders]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Premium Clients
        </p>
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
          VIP Clients
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your most valued clients and top spenders
        </p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card className="shadow-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  VIP Clients
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="font-display text-3xl font-semibold text-foreground">
                    {vipData.length}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-accent/50">
                <Crown className="w-5 h-5 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  VIP Revenue
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <p className="font-display text-3xl font-semibold text-foreground">
                    {vipData
                      .reduce((s, d) => s + d.totalSpend, 0)
                      .toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-accent/50">
                <TrendingUp className="w-5 h-5 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50 col-span-2 md:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Eligible for VIP
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="font-display text-3xl font-semibold text-foreground">
                    {allHighSpenders.length}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-secondary">
                <Star className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Clients Grid */}
      <section className="mb-10">
        <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-5">
          VIP Members
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : vipData.length === 0 ? (
          <div
            data-ocid="vip.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <Crown className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-display text-xl mb-1">No VIP clients yet</p>
            <p className="text-sm">
              Mark clients as VIP from the Clients page, or clients with spend
              over {VIP_THRESHOLD.toLocaleString()} MKD become eligible
              automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vipData.map(
              ({ client, clientOrders, totalSpend, isAutoVip }, idx) => (
                <div
                  key={String(client.id)}
                  data-ocid={`vip.item.${idx + 1}`}
                  className="group bg-card border border-border/50 hover:border-primary/30 hover:shadow-card rounded-xl p-5 transition-all duration-200"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
                        <span className="font-display text-lg font-semibold text-primary">
                          {client.firstName[0]}
                          {client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-foreground">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {client.clientType}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Crown className="w-2.5 h-2.5" /> VIP
                      </Badge>
                      {isAutoVip && (
                        <Badge className="gap-1 text-xs bg-chart-5/10 text-chart-5 border border-chart-5/20 hover:bg-chart-5/20">
                          <Star className="w-2.5 h-2.5" /> Auto-VIP
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Spend
                      </p>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {totalSpend.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          MKD
                        </span>
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Orders
                      </p>
                      <p className="font-display text-lg font-semibold text-foreground">
                        {clientOrders.length}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1 min-w-0">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{client.email}</span>
                      </span>
                    )}
                  </div>

                  {/* Recent order */}
                  {clientOrders.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs">
                        <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Latest:</span>
                        <span className="text-foreground font-medium">
                          {clientOrders[clientOrders.length - 1].productName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* Auto-VIP Eligible */}
      {allHighSpenders.length > 0 && (
        <section>
          <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-5">
            Eligible for VIP (≥ {VIP_THRESHOLD.toLocaleString()} MKD spend)
          </h2>
          <div className="space-y-2">
            {allHighSpenders.map(({ client, totalSpend }, idx) => (
              <div
                key={String(client.id)}
                data-ocid={`vip.eligible.item.${idx + 1}`}
                className="flex items-center justify-between p-4 bg-card border border-dashed border-border hover:border-chart-5/40 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/40 flex items-center justify-center">
                    <span className="font-display text-sm font-semibold text-primary">
                      {client.firstName[0]}
                      {client.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.clientType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {totalSpend.toLocaleString()} MKD
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs text-chart-5 border-chart-5/30"
                  >
                    Eligible
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
