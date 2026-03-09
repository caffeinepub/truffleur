import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import {
  ArrowLeft,
  ChevronRight,
  Crown,
  Instagram,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Client, Order } from "../backend.d";
import ClientForm from "../components/ClientForm";
import OrderForm from "../components/OrderForm";
import { useGetAllClients, useGetAllOrders } from "../hooks/useQueries";
import { StatusBadge } from "./Dashboard";

export default function Clients() {
  const { data: clients = [], isLoading } = useGetAllClients();
  const { data: orders = [] } = useGetAllOrders();
  const [search, setSearch] = useState("");
  const [vipOnly, setVipOnly] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchVip = !vipOnly || c.isVip;
    return matchSearch && matchVip;
  });

  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        orders={orders.filter((o) => o.clientId === selectedClient.id)}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            CRM
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Clients
          </h1>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="clients.add_client.button"
              className="gap-2 min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                New Client
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-2">
              <ClientForm onSuccess={() => setAddOpen(false)} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </header>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="clients.search.input"
            className="pl-9"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Toggle
          data-ocid="clients.vip_filter.toggle"
          pressed={vipOnly}
          onPressedChange={setVipOnly}
          variant="outline"
          className="gap-2 shrink-0 min-h-[44px]"
        >
          <Crown className="w-4 h-4" />
          <span className="hidden sm:inline">VIP Only</span>
          <span className="sm:hidden">VIP</span>
        </Toggle>
      </div>

      {/* Client list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="clients.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No clients found</p>
          <p className="text-sm mt-1">Add your first client to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client, idx) => (
            <button
              type="button"
              key={String(client.id)}
              data-ocid={`clients.item.${idx + 1}`}
              onClick={() => setSelectedClient(client)}
              className="w-full group flex items-center gap-4 py-4 px-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-200 text-left min-h-[64px]"
            >
              <div className="w-10 h-10 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
                <span className="font-display text-sm font-semibold text-primary">
                  {client.firstName[0]}
                  {client.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">
                    {client.firstName} {client.lastName}
                  </span>
                  {client.isVip && (
                    <Badge variant="secondary" className="text-xs gap-1 py-0">
                      <Crown className="w-2.5 h-2.5" /> VIP
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {client.phone && <span>{client.phone}</span>}
                  {client.instagram && <span>{client.instagram}</span>}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientDetail({
  client,
  orders,
  onBack,
}: {
  client: Client;
  orders: Order[];
  onBack: () => void;
}) {
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const totalSpent = orders.reduce((s, o) => s + Number(o.price), 0);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </button>

      {/* Profile header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
          <span className="font-display text-2xl font-semibold text-primary">
            {client.firstName[0]}
            {client.lastName[0]}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {client.firstName} {client.lastName}
            </h1>
            {client.isVip && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="w-3 h-3" /> VIP
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {client.clientType}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1">
            Orders
          </p>
          <p className="font-display text-3xl font-semibold text-foreground">
            {orders.length}
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1">
            Total Spent
          </p>
          <p className="font-display text-2xl font-semibold text-foreground">
            {totalSpent.toLocaleString()} MKD
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="bg-card border border-border/50 rounded-xl shadow-card p-5 mb-5 space-y-4">
        {[
          { icon: Phone, label: "Phone", value: client.phone },
          { icon: Instagram, label: "Instagram", value: client.instagram },
          { icon: Mail, label: "Email", value: client.email },
        ]
          .filter((f) => f.value)
          .map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="text-sm font-medium text-foreground">{f.value}</p>
              </div>
            </div>
          ))}
        {client.favoriteFlowers && (
          <InfoRow label="Favourite Flowers" value={client.favoriteFlowers} />
        )}
        {client.favoriteTruffles && (
          <InfoRow label="Favourite Sweets" value={client.favoriteTruffles} />
        )}
        {client.importantDates && (
          <InfoRow label="Important Dates" value={client.importantDates} />
        )}
        {client.notes && <InfoRow label="Notes" value={client.notes} />}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Dialog open={addOrderOpen} onOpenChange={setAddOrderOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 min-h-[44px]"
              data-ocid="client_detail.add_order.button"
            >
              <ShoppingBag className="w-4 h-4" /> Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                New Order
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-2">
              <OrderForm
                defaultClientName={`${client.firstName} ${client.lastName}`}
                onSuccess={() => setAddOrderOpen(false)}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Order history */}
      {orders.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-medium text-foreground mb-4">
            Order History
          </h2>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={String(order.id)}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-card border border-border/50 rounded-xl"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{String(order.id).padStart(3, "0")}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {order.productName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.deliveryDate} · {order.occasion}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {Number(order.price).toLocaleString()} MKD
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
