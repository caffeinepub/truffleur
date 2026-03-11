import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import PasswordGate from "./components/PasswordGate";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Vip from "./pages/Vip";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients",
  component: Clients,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  validateSearch: (search: Record<string, unknown>) => ({
    highlight: search.highlight ? String(search.highlight) : undefined,
  }),
  component: Orders,
});

const vipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vip",
  component: Vip,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calendar",
  component: Calendar,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: Products,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: Reports,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  clientsRoute,
  ordersRoute,
  vipRoute,
  calendarRoute,
  productsRoute,
  reportsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <PasswordGate>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.99 0.007 78)",
            border: "1px solid oklch(0.88 0.025 72)",
            color: "oklch(0.22 0.04 46)",
          },
        }}
      />
    </PasswordGate>
  );
}
