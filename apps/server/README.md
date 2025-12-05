# @beep/server — server runtime host

Effect-first shell for running backend workloads (HTTP, RPC, cron, and queued jobs) on Bun. This app is meant to compose slice runtimes via `@beep/runtime-server` so telemetry, logging, database connections, and IAM/files adapters are provided through Layers instead of ad-hoc wiring.

## Status
- Entry point is currently a placeholder (`src/server.ts` exports `beep`). Wire new hosts through `@beep/runtime-server` before shipping user-facing endpoints.
- Build artifacts land in `build/esm` and `build/dts` via `tsconfig.build.json`.

## Quick start
- Install deps at the repo root (`bun install`) and load env with root scripts (`bun run dev --filter=@beep/server` or `bun run --cwd apps/server dev`).
- Build: `bun run build --filter=@beep/server`
- Type check: `bun run check --filter=@beep/server`
- Lint: `bun run lint --filter=@beep/server` (or `lint:fix` to autofix)
- Tests: `bun run test --filter=@beep/server`
- Run compiled output (requires `.env` at repo root): `bun run start --filter=@beep/server`

## Architecture
- Runtime & DI: import `runServerPromise` / `serverRuntime` from `@beep/runtime-server` to execute effects with observability and slice repositories pre-wired.
- Configuration: read environment through `@beep/shared-infra` (`serverEnv`, `clientEnv`) so OTLP endpoints, log level, and service naming stay consistent with the rest of the stack.
- Observability: telemetry/logging/devtools are provided by `@beep/runtime-server` (OTLP exporters, pretty logger in dev, optional DevTools websocket).
- Persistence: database connections and repositories come from slice layers (`@beep/iam-infra`, `@beep/documents-infra`) fed through `@beep/shared-infra`.

## When adding a real server
- Prefer `@effect/platform-bun` for HTTP/socket servers and wrap handlers with `runServerPromise` to keep tracing spans.
- Keep platform concerns (ports, TLS, worker counts) configurable via `serverEnv`; do not read `process.env` directly.
- Reuse contract kits (`@beep/contract`, slice SDKs) instead of hand-parsing payloads; validate inputs with `@beep/schema`.
- Follow repo guardrails: namespace Effect imports, avoid native array/string helpers, and keep logs JSON-safe in production.
