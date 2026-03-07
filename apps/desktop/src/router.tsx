import { createRootRoute, createRoute, createRouter, Link, Outlet } from "@tanstack/react-router";
import { RepoMemoryDesktop } from "./RepoMemoryDesktop.tsx";

const rootRoute = createRootRoute({
  component: () => (
    <div className="shell">
      <header className="hero">
        <p className="eyebrow">Beep Desktop</p>
        <h1>Local-first repo expert memory</h1>
        <p className="lede">
          Native Tauri shell. Bun + Effect sidecar owns runtime semantics. The desktop surface only talks to the public
          control plane and workflow RPC boundary while the shell owns process lifecycle and OS glue.
        </p>
        <nav className="nav">
          <Link to="/" activeProps={{ className: "nav-link nav-link-active" }} className="nav-link">
            Workspace
          </Link>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: RepoMemoryDesktop,
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
