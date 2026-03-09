import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  Crown,
  Gem,
  LayoutDashboard,
  LayoutGrid,
  MoreHorizontal,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const primaryNavItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  { to: "/clients", label: "Clients", icon: Users, ocid: "nav.clients.link" },
  {
    to: "/orders",
    label: "Orders",
    icon: ShoppingBag,
    ocid: "nav.orders.link",
  },
  {
    to: "/vip",
    label: "VIP",
    icon: Crown,
    ocid: "nav.vip.link",
  },
];

const secondaryNavItems = [
  {
    to: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    ocid: "nav.calendar.link",
  },
  {
    to: "/products",
    label: "Products",
    icon: LayoutGrid,
    ocid: "nav.products.link",
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    ocid: "nav.reports.link",
  },
];

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar z-30">
        {/* Logo */}
        <div className="px-7 py-8 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
              <Gem className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-sidebar-foreground tracking-widest uppercase">
                Truffleur
              </h1>
              <p className="text-xs text-sidebar-foreground/50 tracking-wider uppercase font-light">
                Studio
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-xs font-medium text-sidebar-foreground/40 tracking-widest uppercase px-3 mb-4">
            Navigation
          </p>
          {allNavItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={item.ocid}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                  }`}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/30 leading-relaxed">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-sidebar-foreground/60 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-sidebar border-t border-sidebar-border">
        <div className="flex items-stretch">
          {primaryNavItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={item.ocid}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            type="button"
            data-ocid="nav.more.button"
            onClick={() => setMoreOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${
              secondaryNavItems.some((item) =>
                location.pathname.startsWith(item.to),
              )
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/50"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide">More</span>
          </button>
        </div>
      </nav>

      {/* More Sheet (mobile) */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="bg-sidebar border-sidebar-border rounded-t-2xl pb-safe"
          data-ocid="nav.more.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-sidebar-foreground text-lg tracking-wider uppercase">
              More
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-1 pb-6">
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={item.ocid}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/40"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-sidebar-foreground/30 text-center pb-2">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
