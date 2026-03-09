import { Link, useLocation } from "@tanstack/react-router";
import { Gem, LayoutDashboard, ShoppingBag, Users } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
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
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
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
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="text-xs font-medium text-sidebar-foreground/40 tracking-widest uppercase px-3 mb-4">
            Navigation
          </p>
          {navItems.map((item) => {
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

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-sidebar-primary" />
          <span className="font-display text-base font-semibold text-sidebar-foreground tracking-widest uppercase">
            Truffleur
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={item.ocid}
                className={`p-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
