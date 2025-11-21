# @beep/start-client — TanStack Router + Effect RPC Todo PWA

A Vite-powered sample that pairs TanStack Router + `@effect-atom/atom-react` on the client with an Effect RPC WebSocket server on Bun. The app ships an offline-friendly PWA shell, a Honeycomb-ready tracer, and a SQLite-backed Todo service wired through typed RPC contracts.

## Quick start
- Install deps once at repo root: `bun install`.
- Run both client and server: `bun run dev --filter @beep/start-client` (spawns Vite + Bun RPC server via `concurrently`).
- Client-only: `bun run dev:client --filter @beep/start-client`.
- Server-only: `bun run dev:server --filter @beep/start-client` (serves RPC on `ws://localhost:3000/rpc`).
- Preview static build: `bun run build --filter @beep/start-client` then `bun run preview --filter @beep/start-client`.
- Type/lint checks: `bun run check|lint|lint:fix --filter @beep/start-client`.

## Runtime configuration
- `DATABASE_PATH` (optional) — SQLite file path; defaults to `todos.db` in this workspace.
- `VITE_HONEYCOMB_API_KEY` (optional) — when set, client traces are sent to Honeycomb via OTLP; otherwise tracing is disabled.
- `.envrc` is present for direnv users; Vite also consumes `import.meta.env` for client config.

## Architecture map
- **Client (`src/client`)**
  - TanStack Router routes generated from `routes/` with `@tanstack/router-plugin`.
  - `Atom.runtime.addGlobalLayer` attaches tracer + config provider; atoms live under `App/`, `Todos/`, and `atoms/`.
  - RPC client (`RpcClient.ts`) uses `AtomRpc` and a Browser WebSocket protocol to call the Todo server.
  - UI state is atom-first (`Result.match`, `useAtomValue`, `useAtomSet`), with motion animations and PWA registration (`useRegisterSW`).
- **Shared (`src/shared`)**
  - `rpc/TodoRpcs.ts` defines the contract (payload/success/error schemas) used by both client and server.
  - `types/` holds branded IDs, schema-backed Todo models, and tagged errors (`TodoServiceError`).
- **Server (`src/server`)**
  - Bun HTTP server hosting Effect RPC over WebSocket (`/rpc`) aka `RpcServer.layer` + `BunHttpServer`.
  - SQLite service (`db/client.ts`) with automatic migrations from `db/migrations/0001_create_todos.ts`; names are camel↔snake transformed.
  - `services/todo-service/TodoService.ts` provides CRUD operations with schema validation, typed errors, and a `TestLayer` for in-memory use.

## PWA + assets
- `vite-plugin-pwa` emits the manifest, service worker, and icons under `dist/`. `pwa-assets.config.ts` controls asset generation.
- Workbox caches `**/*.{js,css,html,svg,png,ico,wasm}` with cleanup and `clientsClaim`. Dev PWA mode is disabled by default.

## Development notes
- Path aliases: `@client/*`, `@server/*`, `@shared/*` configured in `vite.config.ts`.
- RPC client targets `ws://localhost:3000/rpc`; keep server running for live mutations.
- Migrations run on startup via `MigrationsLive`; deleting `todos.db` will recreate schema on next boot.
- Default log output uses `Logger.pretty` on the client runtime; adjust in `src/client/main.tsx` if needed.
