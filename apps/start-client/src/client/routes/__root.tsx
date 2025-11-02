import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col bg-primary">
      <header>
        <div className="flex">
          <div className="flex-1" />
          <div className="flex-1" />
        </div>
        <div className="px-4" />
      </header>
      <main className="flex-1 bg-white px-2 sm:px-4 pb-18">
        <div className="container mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  ),
});
