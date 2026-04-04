import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { EditorWorkspaceApp } from "./EditorWorkspaceApp.tsx";

const rootRoute = createRootRoute({
  component: () => <EditorWorkspaceApp />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EditorWorkspaceApp,
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
