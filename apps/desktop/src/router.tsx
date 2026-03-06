import { createRootRoute, createRoute, createRouter, Link, Outlet } from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <div className="shell">
      <header className="hero">
        <p className="eyebrow">Beep Desktop</p>
        <h1>Local-first repo expert memory</h1>
        <p className="lede">
          Thin React shell. Bun + Effect sidecar owns runtime semantics. Tauri remains the shell target, not the
          business-logic center.
        </p>
        <nav className="nav">
          <Link to="/" activeProps={{ className: "nav-link nav-link-active" }} className="nav-link">
            Overview
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
  component: () => (
    <section className="grid">
      <article className="card">
        <h2>Protocol-first</h2>
        <p>The shell talks only to public protocol and client packages. It does not reach into server internals.</p>
      </article>
      <article className="card">
        <h2>Grounded answers</h2>
        <p>
          Query results are expected to carry citations and a retrieval packet. That requirement belongs to the runtime,
          not the UI.
        </p>
      </article>
      <article className="card">
        <h2>Next step</h2>
        <p>Wire a real sidecar bootstrap flow, then add repo registration, indexing, and one grounded answer screen.</p>
      </article>
    </section>
  ),
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
