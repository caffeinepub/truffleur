import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Truck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGetAllOrders } from "../hooks/useQueries";
import { parseDatePart, parseTimePart } from "../lib/dateUtils";

type CalendarEvent = {
  date: string;
  time: string;
  label: string;
  address: string;
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
const DAY_LABELS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

export default function Calendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

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

  function handleDayClick(dateStr: string, hasEvents: boolean) {
    if (!hasEvents) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  function goToOrder(orderId: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigate({ to: "/orders", search: { highlight: orderId } });
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in pb-4">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Schedule
        </p>
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
          Calendar
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Deliveries and upcoming events · Tap any event to view the order
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 pb-6">
        <div className="flex-1 min-w-0">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              data-ocid="calendar.pagination_prev"
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
              data-ocid="calendar.pagination_next"
              className="w-9 h-9 border-border/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-muted-foreground py-2 tracking-wider"
              >
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{DAY_LABELS_SHORT[i]}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <Skeleton
              className="h-64 w-full rounded-xl"
              data-ocid="calendar.loading_state"
            />
          ) : (
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {cells.map(({ key, date }) => {
                if (!date)
                  return (
                    <div key={key} className="min-h-[52px] sm:min-h-[80px]" />
                  );
                const dateStr = formatDate(date);
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={key}
                    onClick={() => handleDayClick(dateStr, hasEvents)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleDayClick(dateStr, hasEvents)
                    }
                    data-ocid={hasEvents ? "calendar.canvas_target" : undefined}
                    className={[
                      "min-h-[52px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-lg border transition-colors",
                      hasEvents ? "cursor-pointer" : "",
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : isToday
                          ? "border-primary/50 bg-accent/30"
                          : "border-border/40 bg-card hover:bg-secondary/30",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-xs font-medium block text-right mb-1",
                        isToday
                          ? "text-primary font-bold"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {date.getDate()}
                    </span>

                    {/* Desktop: show full event pills — clickable */}
                    <div className="hidden sm:flex flex-col gap-1">
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.orderId}
                          type="button"
                          onClick={(e) => goToOrder(ev.orderId, e)}
                          data-ocid="calendar.event.button"
                          className="rounded-md px-1.5 py-1 bg-chart-3/15 border border-chart-3/20 text-chart-3 hover:bg-chart-3/25 hover:border-chart-3/40 transition-colors cursor-pointer text-left w-full group"
                        >
                          <div className="flex items-start gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-chart-3 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-medium leading-snug break-words min-w-0 flex-1">
                              {ev.label}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </div>
                          {ev.time && (
                            <div className="flex items-center gap-1 mt-0.5 pl-2.5">
                              <Clock className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                              <span className="text-[10px] text-muted-foreground">
                                {ev.time}
                              </span>
                            </div>
                          )}
                          {ev.address && (
                            <div className="flex items-start gap-1 mt-0.5 pl-2.5">
                              <MapPin className="w-2.5 h-2.5 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-[10px] text-muted-foreground leading-snug break-words">
                                {ev.address}
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Mobile: dot indicators — tap to see details below */}
                    {hasEvents && (
                      <div className="flex sm:hidden flex-wrap gap-0.5 justify-center mt-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.orderId}
                            className="w-1.5 h-1.5 rounded-full bg-chart-3"
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[8px] text-chart-3 leading-none">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile: selected day detail panel */}
          {selectedDate && selectedEvents.length > 0 && (
            <div
              className="sm:hidden mt-4 rounded-xl border border-primary/30 bg-card p-4"
              data-ocid="calendar.panel"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {(() => {
                    const d = new Date(selectedDate);
                    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                  })()}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                  onClick={() => setSelectedDate(null)}
                  data-ocid="calendar.close_button"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                {selectedEvents.map((ev, i) => (
                  <button
                    key={ev.orderId}
                    type="button"
                    data-ocid={`calendar.item.${i + 1}`}
                    onClick={(e) => goToOrder(ev.orderId, e)}
                    className="w-full text-left rounded-lg bg-chart-3/10 border border-chart-3/20 p-3 hover:bg-chart-3/20 hover:border-chart-3/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-chart-3 shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {ev.label}
                          </p>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {ev.time && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {ev.time}
                            </span>
                          </div>
                        )}
                        {ev.address && (
                          <div className="flex items-start gap-1.5 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground leading-snug">
                              {ev.address}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-primary mt-2 font-medium">
                          Tap to view order →
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile tap hint */}
          {!selectedDate && (
            <p className="sm:hidden mt-3 text-center text-[11px] text-muted-foreground">
              Tap a day with dots to see order details
            </p>
          )}

          <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-chart-3" />
              Delivery · Tap event to open order
            </div>
          </div>
        </div>

        {/* Upcoming sidebar */}
        <aside className="lg:w-80">
          <h2 className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
            Upcoming (30 days)
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
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
            <ScrollArea className="max-h-[500px] lg:max-h-[70vh]">
              <div className="space-y-2 pr-2">
                {upcoming.map((ev, idx) => {
                  const evDate = new Date(ev.date);
                  const diffDays = Math.ceil(
                    (evDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  return (
                    <button
                      key={ev.orderId}
                      type="button"
                      data-ocid={`calendar.upcoming.item.${idx + 1}`}
                      onClick={() =>
                        navigate({
                          to: "/orders",
                          search: { highlight: ev.orderId },
                        })
                      }
                      className="w-full text-left flex gap-3 p-3 bg-card border border-border/50 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex flex-col items-center justify-center shrink-0">
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
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-medium text-foreground leading-snug">
                            {ev.label}
                          </p>
                          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-60 transition-opacity mt-0.5" />
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1.5">
                          {ev.time && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="w-3 h-3 shrink-0" />
                              {ev.time}
                            </span>
                          )}
                          {ev.address && (
                            <span className="flex items-start gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                              <span className="leading-snug">{ev.address}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
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
                    </button>
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
