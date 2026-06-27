import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="h-dvh flex flex-col">
      <Outlet />
    </div>
  ),
});
