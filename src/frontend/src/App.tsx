import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";

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
  component: Orders,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  clientsRoute,
  ordersRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
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
    </>
  );
}
