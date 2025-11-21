# AGENTS — `apps/start-client`

## Purpose & Fit
- Demo PWA that couples TanStack Router + `@effect-atom/atom-react` with an Effect RPC backend on Bun/SQLite. Showcases typed contracts, Result-driven UI, and offline-capable shell.
- Client bootstraps telemetry + config from `src/client/main.tsx`, renders routes from `routes/`, and registers the PWA service worker.
- Server exposes Todo CRUD via WebSocket RPC on port 3000, backed by SQLite with auto-migrations.

## Surface Map
- **Client entry**: `apps/start-client/src/client/main.tsx` wires `Atom.runtime` layers (tracer + config provider + pretty logger) then mounts `<App />`.
- **Routing**: `src/client/routes/*` plus generated `routeTree.gen.ts`; `_root` template in `routes/__root.tsx` wraps layout.
- **State + RPC**:
  - RPC client: `src/client/RpcClient.ts` (`AtomRpc.Tag` over `TodoRpcs`, WebSocket protocol `ws://localhost:3000/rpc`).
  - Queries/mutations: `Todos/atoms.ts` (`TodoClient.query("getTodos")`, mutations with `reactivityKeys: ["todos"]`).
  - UI surfaces: `Todos/TodoResults.tsx`, `components/*` (Result matching, filter atom, motion animations).
  - Install PWA prompt: `App/atoms.ts` + `App/InstallButton.tsx`.
- **Tracing**: `src/client/Tracing.ts` builds OTLP tracer when `VITE_HONEYCOMB_API_KEY` is present; otherwise returns `Layer.empty`.
- **Server**:
  - Entry: `src/server/main.ts` (RPC server + Bun HTTP server).
  - DB/migrations: `src/server/db/client.ts`, `src/server/db/migrations.ts`, `src/server/db/migrations/0001_create_todos.ts`.
  - Service: `src/server/services/todo-service/TodoService.ts` (SQLite impl + `TestLayer`).
- **Shared contract**: `src/shared/rpc/TodoRpcs.ts` + schemas in `src/shared/types/*` (branded IDs, tagged errors, `Schema.Class` Todo).
- **PWA**: `vite.config.ts` + `pwa-assets.config.ts` generate manifest, icons, and service worker; assets live in `public/` and `dist/`.

## Guardrails
- Honor repo-wide Effect rules: namespace imports for Effect modules; never reintroduce native array/string/object helpers—pipe through `effect/Array`, `effect/String`, etc.
- Keep the RPC endpoint stable unless adding environment-driven configuration; clients assume `ws://localhost:3000/rpc` and `reactivityKeys: ["todos"]` for cache invalidation.
- Migrations should remain idempotent; use `SqliteMigrator` patterns already in `db/migrations.ts`. Deleting `todos.db` recreates schema on next boot—avoid breaking existing file paths.
- Preserve Result-based rendering (`Result.match`/`Result.builder`) instead of ad-hoc loading/error booleans; mutations should set `reactivityKeys` to refresh queries.
- When touching PWA setup, regenerate assets via `bun run build --filter @beep/start-client` (workbox + manifest) and keep `pwa-assets.config.ts` in sync.
- Tracing: only emit OTLP when the Honeycomb API key is present; do not hardcode secrets or move tracer construction outside `Layer.unwrapEffect`.
- Respect path aliases `@client`, `@server`, `@shared`; avoid relative traversals that break Vite aliases.

## Verification
- Type/lint: `bun run check --filter @beep/start-client`, `bun run lint --filter @beep/start-client`.
- Build/PWA: `bun run build --filter @beep/start-client` (emits `dist/` with service worker + assets), optional `bun run preview --filter @beep/start-client`.
- Runtime sanity: `bun run dev --filter @beep/start-client`, load `/` and confirm todos mutate via RPC (WebSocket on :3000) and PWA prompt appears when installable.
- DB reset (if needed): stop server, remove `apps/start-client/todos.db`, restart to rerun migration `0001_create_todos.ts`.

## Contribution checklist
- Update this doc when changing RPC contracts, routes, or PWA/tracing behavior.
- Keep Todo service errors tagged schemas (`TodoServiceError` union) and ensure client surfaces handle all variants.
- For tests, prefer `TodoService.TestLayer` to avoid file I/O; wire it through custom layers instead of patching the SQLite impl.
