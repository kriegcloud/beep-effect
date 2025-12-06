# @beep/server

Effect-first backend runtime host for the beep-effect monorepo.

## Purpose

This package serves as the entry point for running backend workloads (HTTP servers, RPC endpoints, cron jobs, and background workers) on Bun. The server composes slice runtimes via `@beep/runtime-server`, providing telemetry, logging, database connections, and slice adapters (IAM, documents) through Effect Layers rather than ad-hoc wiring. Currently, the entry point is a placeholder awaiting production host implementation.

## Status

- Entry point is currently a placeholder (`src/server.ts` exports `beep`)
- Wire new hosts through `@beep/runtime-server` before shipping user-facing endpoints
- Build artifacts land in `build/esm` and `build/dts` via `tsconfig.build.json`

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `beep` | `string` | Placeholder export (to be replaced with actual runtime host) |

**Note**: Production exports will come from `@beep/runtime-server`:
- `runServerPromise` — Execute effects with tracing spans
- `runServerPromiseExit` — Execute effects and capture full Exit value
- `serverRuntime` — ManagedRuntime instance with all layers pre-wired

## Usage Examples

### Running Effects with Server Runtime

```typescript
import { runServerPromise } from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";

export const healthcheck = () =>
  runServerPromise(
    Effect.gen(function* () {
      const status = F.pipe("ok", Str.toUpperCase);
      yield* Effect.logInfo("server.health", { status });
      return { status };
    }).pipe(Effect.withSpan("server.health")),
    "server.health"
  );
```

### Building an HTTP Server

```typescript
import { runServerPromise } from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import { BunHttpServer } from "@effect/platform-bun";

const routes = [
  { path: "/health", handler: healthcheck },
  { path: "/api/users", handler: listUsers },
];

export const startServer = () =>
  runServerPromise(
    Effect.gen(function* () {
      const server = yield* BunHttpServer.BunHttpServer;

      yield* Effect.logInfo("server.starting", {
        routes: F.pipe(routes, A.map((r) => r.path))
      });

      // Wire up routes and start server
      yield* server.start({ port: 3000 });
    }).pipe(Effect.withSpan("server.start")),
    "server.start"
  );
```

### Accessing Slice Services

```typescript
import { runServerPromise } from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import { UserRepo } from "@beep/iam-infra";

export const listActiveUsers = () =>
  runServerPromise(
    Effect.gen(function* () {
      const userRepo = yield* UserRepo;
      const users = yield* userRepo.findAll();

      const activeUsers = F.pipe(
        users,
        A.filter((user) => user.isActive)
      );

      yield* Effect.logInfo("users.active.listed", {
        count: activeUsers.length
      });

      return activeUsers;
    }).pipe(Effect.withSpan("users.listActive")),
    "users.listActive"
  );
```

## Architecture

### Runtime & Dependency Injection

Import `runServerPromise`, `runServerPromiseExit`, and `serverRuntime` from `@beep/runtime-server` to execute effects with observability and slice repositories pre-wired through Layers.

### Configuration

Read environment through `@beep/shared-infra` (`serverEnv`, `clientEnv`) to keep OTLP endpoints, log levels, and service naming consistent across the stack. Never read `process.env` or `Bun.env` directly.

### Observability

Telemetry, logging, and DevTools are provided by `@beep/runtime-server` with OTLP exporters, pretty logger in dev mode, and optional DevTools WebSocket.

### Persistence

Database connections and repositories come from slice layers (`@beep/iam-infra`, `@beep/documents-infra`) fed through `@beep/shared-infra`.

## Dependencies

| Category | Packages |
|----------|----------|
| **Runtime** | `@beep/runtime-server` |
| **Slices** | `@beep/iam-domain`, `@beep/iam-infra`, `@beep/iam-tables`, `@beep/documents-domain`, `@beep/documents-infra`, `@beep/documents-tables` |
| **Common** | `@beep/constants`, `@beep/contract`, `@beep/errors`, `@beep/identity`, `@beep/invariant`, `@beep/schema`, `@beep/utils` |
| **Shared** | `@beep/shared-domain`, `@beep/shared-tables` |
| **Effect** | `effect`, `@effect/platform`, `@effect/platform-bun`, `@effect/rpc`, `@effect/sql`, `@effect/sql-pg`, `@effect/opentelemetry` |
| **AI** | `@effect/ai`, `@effect/ai-anthropic`, `@effect/ai-openai` |
| **Orchestration** | `@effect/cluster`, `@effect/workflow`, `@effect/experimental` |
| **Testing** | `@beep/mock`, `@testcontainers/postgresql` |

## Development Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload (loads `.env` from repo root) |
| `bun run build` | Compile TypeScript to `build/esm` and `build/dts` |
| `bun run check` | Type-check with TypeScript |
| `bun run lint` | Lint with Biome |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run lint:circular` | Check for circular dependencies |
| `bun run test` | Run test suite |
| `bun run coverage` | Run tests with coverage report |
| `bun run start` | Run compiled server (requires `.env` at repo root) |
| `bun run start:source` | Run from source (same as `start`) |

**Note**: Prefer running via root scripts with filter: `bun run dev --filter=@beep/server`

## Guidelines for Adding Real Servers

### Platform Bindings

- Prefer `@effect/platform-bun` for HTTP/socket servers
- Wrap handlers with `runServerPromise` to maintain tracing spans
- Provide `ObservabilityLive` and `LogLevelLive` when building servers

### Configuration

- Keep platform concerns (ports, TLS, worker counts) configurable via `serverEnv`
- Never read `process.env` directly

### Contracts

- Reuse contract kits from `@beep/contract` and slice SDKs
- Validate inputs with `@beep/schema`
- Avoid hand-parsing payloads

### Error Handling & Logging

- Use tagged errors from `@beep/errors` and `@beep/invariant`
- Keep logs JSON-safe in production
- Avoid logging secrets or sensitive request bodies

### Performance

- Keep Layers memoizable (`Layer.mergeAll`, `Layer.provideMerge`)
- Avoid spinning new DB connections per request

## Critical Rules

### Effect-First Development

- No `async/await` or bare Promises in application code
- Use `Effect.gen`, `Effect.fn`, `Effect.tryPromise` with tagged errors
- All dependency injection through Layers (no singletons or mutable module state)

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Single-letter aliases
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
```

### Required Effect Utilities

```typescript
// Array operations
F.pipe(items, A.map((item) => item.name));        // not items.map()
F.pipe(items, A.filter((item) => item.active));   // not items.filter()

// String operations
F.pipe(str, Str.toUpperCase);                      // not str.toUpperCase()
F.pipe(str, Str.split(" "));                       // not str.split()
```

## See Also

- `packages/runtime/server/AGENTS.md` — Runtime layer patterns
- `CLAUDE.md` — Monorepo-wide conventions
- `docs/patterns/` — Implementation recipes
