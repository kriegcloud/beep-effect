import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { TwoTvPage } from "./components/two-tv.tsx";

const rootRoute = createRootRoute({
  component: () => <TwoTvPage />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TwoTvPage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
