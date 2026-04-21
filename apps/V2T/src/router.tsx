/**
 * TanStack router configuration for the V2T app.
 *
 * @module
 * @since 0.0.0
 */
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

/**
 * V2T application router.
 *
 * @example
 * ```ts
 * import { router } from "@beep/v2t/router"
 *
 * const routeTree = router.routeTree
 * ```
 *
 * @category routing
 * @since 0.0.0
 */
export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
