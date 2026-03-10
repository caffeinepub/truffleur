import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Clock, MapPin, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useGetAllOrders } from "../hooks/useQueries";
import { parseDatePart, parseTimePart } from "../lib/dateUtils";

type CalendarEvent = {
  date: string; // date portion only "YYYY-MM-DD"
  time: string; // "HH:MM" or ""
  label: string; // "clientName — productName"
  address: string; // deliveryAddress or "Pickup"
  type: "delivery";
  orderId: string;
};

type CalendarCell = { key: string; date: Date | null };

function getMonthDays(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `empty-${year}-${month}-${i}`, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ key: formatDate(date), date });
  }
  return cells;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { data: orders = [], isLoading } = useGetAllOrders();

  const events = useMemo<CalendarEvent[]>(() => {
    return orders
      .filter((o) => o.deliveryDate && o.status !== "Cancelled")
      .map((o) => ({
        date: parseDatePart(o.deliveryDate),
        time: parseTimePart(o.deliveryDate),
        label: `${o.clientName} — ${o.productName}`,
        address: o.isPickup ? "Pickup" : o.deliveryAddress || "",
        type: "delivery" as const,
        orderId: String(o.id),
      }));
  }, [orders]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const cells = getMonthDays(viewYear, viewMonth);
  const todayStr = formatDate(today);

  const upcoming = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return events
      .filter((ev) => {
        const d = new Date(ev.date);
        return d >= now && d <= limit;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 20);
  }, [events]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Schedule
        </p>
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
          Calendar
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Deliveries and upcoming events
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              data-ocid="calendar.prev.button"
              className="w-9 h-9 border-border/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              data-ocid="calendar.next.button"
              className="w-9 h-9 border-border/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-muted-foreground py-2 tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {isLoading ? (
            <Skeleton
              className="h-64 w-full rounded-xl"
              data-ocid="calendar.loading_state"
            />
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map(({ key, date }) => {
                if (!date) return <div key={key} />;
                const dateStr = formatDate(date);
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isCurrentMonth = date.getMonth() === viewMonth;

                return (
                  <div
                    key={key}
                    className={`min-h-[72px] p-1.5 rounded-lg border transition-colors ${
                      isToday
                        ? "border-primary/50 bg-accent/30"
                        : isCurrentMonth
                          ? "border-border/40 bg-card hover:bg-secondary/50"
                          : "border-transparent bg-transparent"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium block text-right mb-1 ${
                        isToday
                          ? "text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.orderId}
                          title={`${ev.label}${ev.time ? ` · ${ev.time}` : ""}${ev.address ? ` · ${ev.address}` : ""}`}
                          className="flex items-center gap-1 px-1 py-0.5 rounded text-xs bg-chart-3/15 text-chart-3 truncate"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-chart-3 shrink-0" />
                          <span className="truncate text-[10px] flex-1">
                            {ev.label.split(" — ")[0]}
                          </span>
                          {ev.time && (
                            <span className="text-[9px] text-muted-foreground shrink-0">
                              {ev.time}
                            </span>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-chart-3" />
              Delivery
            </div>
          </div>
        </div>

        <aside className="lg:w-72">
          <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
            Upcoming (30 days)
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div
              data-ocid="calendar.empty_state"
              className="text-center py-10 text-muted-foreground"
            >
              <Truck className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No upcoming deliveries</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2 pr-2">
                {upcoming.map((ev, idx) => {
                  const evDate = new Date(ev.date);
                  const diffDays = Math.ceil(
                    (evDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  return (
                    <div
                      key={ev.orderId}
                      data-ocid={`calendar.upcoming.item.${idx + 1}`}
                      className="flex gap-3 p-3 bg-card border border-border/50 rounded-xl"
                    >
                      <div className="w-9 h-9 rounded-lg bg-chart-3/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-chart-3 leading-none">
                          {MONTH_NAMES[evDate.getMonth()]
                            .slice(0, 3)
                            .toUpperCase()}
                        </span>
                        <span className="font-display text-base font-bold text-chart-3 leading-none">
                          {evDate.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {ev.label}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          {ev.time && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              {ev.time}
                            </span>
                          )}
                          {ev.address && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate max-w-[140px]">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{ev.address}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-chart-3 border-chart-3/30"
                          >
                            Delivery
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {diffDays === 0
                              ? "Today"
                              : diffDays === 1
                                ? "Tomorrow"
                                : `in ${diffDays} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </aside>
      </div>
    </div>
  );
}
