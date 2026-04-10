import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { EditorWorkspaceApp } from "./EditorWorkspaceApp.tsx";
import { RegistryPreviewPage } from "./RegistryPreviewPage.tsx";

const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EditorWorkspaceApp,
});

const registryPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/registry-preview",
  component: RegistryPreviewPage,
});

const routeTree = rootRoute.addChildren([indexRoute, registryPreviewRoute]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
