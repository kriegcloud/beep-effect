# @beep/runtime-server

The server runtime package providing a production-grade Effect ManagedRuntime for server-side applications.

## Purpose

Provides the production-grade Effect runtime that powers all server-side entry points in the beep-effect monorepo. This package bundles observability (logging, tracing, metrics), persistence (database clients, repositories), authentication, and domain services (IAM, Documents) into a single, cohesive ManagedRuntime that ensures consistent telemetry, dependency injection, and error handling across all server contexts.

Acts as the shared runtime for API routes (`apps/web/src/app/api/*`), background jobs, and any future Bun/Node hosts, eliminating the need for applications to manually wire up layers.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/runtime-server": "workspace:*"
```

## Key Exports

### Primary Runtime Exports

| Export                 | Description                                                                   |
|------------------------|-------------------------------------------------------------------------------|
| `serverRuntime`        | ManagedRuntime instance providing all server-side services and observability |
| `runServerPromise`     | Execute an Effect with automatic tracing span wrapping, returns Promise      |
| `runServerPromiseExit` | Execute an Effect with span wrapping, returns full Exit value                |

### Internal Layer Exports (via wildcard exports)

Access these via `@beep/runtime-server/ModuleName`:

| Export                     | Module           | Description                                                           |
|----------------------------|------------------|-----------------------------------------------------------------------|
| `AppLive`                  | `App`            | Root application layer merging all slices, tracing, logging, dev tools|
| `TracingLive`              | `Tracing`        | OTLP exporters for traces, logs, metrics with service name binding    |
| `LoggingLive`              | `Logging`        | Pretty console logger (dev) or JSON logger (prod), configurable level |
| `httpLogger`               | `Logging`        | HTTP middleware for request/response logging                          |
| `RpcLogger`, `RpcLoggerLive`| `Logging`       | RPC middleware for logging RPC request failures                       |
| `DevToolsLive`             | `DevTools`       | Optional Effect DevTools websocket layer (dev only)                   |
| `SlicesLive`               | `Slices`         | Combined layer providing all domain services (IAM, Documents, Auth)   |
| `CoreSliceServicesLive`    | `Slices`         | Database clients, repositories, and email service layer               |
| `SliceDatabaseClientsLive` | `Slices`         | IamDb, DocumentsDb, and SharedDb live layers                          |
| `SliceReposLive`           | `Slices`         | Combined IAM, Documents, and Shared repository layers                 |
| `CoreServicesLive`         | `CoreServices`   | Core shared services (Email, AuthEmail, SharedServices)               |
| `HealthRouter`             | `HealthRouter`   | HTTP router with GET /health endpoint                                 |
| `CorsLive`                 | `Cors`           | CORS middleware configured with trusted origins                       |

## Architecture Fit

- **Vertical Slice + Hexagonal**: Aggregates infrastructure adapters from multiple slices while keeping domain logic pure
- **Observability-first**: Every execution is traced with OpenTelemetry spans and structured logging
- **Dependency Injection**: Uses Effect Layers to provide all services without manual wiring
- **Environment-aware**: Automatically configures logging, tracing, and dev tools based on environment variables
- **Path alias**: Import as `@beep/runtime-server`

## Module Structure

```
src/
├── index.ts              # Public exports (runServerPromise, serverRuntime)
├── server-runtime.ts     # Deprecated re-exports (use Runtime.ts)
├── Runtime.ts            # ManagedRuntime and execution helpers
├── App.ts                # Root AppLive layer composition
├── Slices.ts             # Domain slice layer aggregation
├── CoreServices.ts       # Core infrastructure services
├── Logging.ts            # Logger configuration (console/JSON, HTTP/RPC loggers)
├── Tracing.ts            # OpenTelemetry configuration
├── DevTools.ts           # Effect DevTools layer
├── Environment.ts        # Environment variable access
├── HealthRouter.ts       # Health check HTTP router
├── Cors.ts               # CORS middleware configuration
└── rpcs/                 # RPC server infrastructure
    ├── index.ts          # RPC exports (currently minimal)
    ├── rpc-server.ts     # RPC server setup
    ├── DbLive.ts         # Database layer for RPC
    ├── AuthLive.ts       # Auth layer for RPC
    └── AuthContextMiddlewareLive.ts # Auth context middleware
```

## Usage

### Basic Server Effect Execution

Execute server-side effects with automatic observability:

```typescript
import { runServerPromise } from "@beep/runtime-server";
import { AuthService } from "@beep/iam-server";
import * as Effect from "effect/Effect";

export async function POST(request: Request) {
  const result = await runServerPromise(
    Effect.gen(function* () {
      const { auth } = yield* AuthService;
      const session = yield* auth.api.getSession({ headers: request.headers });

      yield* Effect.logInfo("session.retrieved", { userId: session.user.id });

      return { success: true, userId: session.user.id };
    }),
    "api.session.get"
  );

  return Response.json(result);
}
```

### Custom Runtime with Additional Services

Extend the base runtime with additional layers:

```typescript
import { AppLive } from "@beep/runtime-server/App";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

class JobQueue extends Effect.Tag("JobQueue")<
  JobQueue,
  { readonly enqueue: (job: string) => Effect.Effect<void> }
>() {}

const JobQueueLive = Layer.succeed(JobQueue, {
  enqueue: (job: string) =>
    Effect.logInfo("job.enqueued", { job })
});

export const jobRuntime = ManagedRuntime.make(
  Layer.mergeAll(JobQueueLive, AppLive)
);

export const enqueueJob = (job: string) =>
  jobRuntime.runPromise(
    Effect.gen(function* () {
      const queue = yield* JobQueue;
      yield* queue.enqueue(job);
    }).pipe(Effect.withSpan("jobs.enqueue"))
  );
```

### Accessing Domain Services

Use repository and service layers provided by the runtime:

```typescript
import { runServerPromise } from "@beep/runtime-server";
import { IamRepos } from "@beep/iam-server";
import { DocumentsRepos } from "@beep/documents-server";
import * as Effect from "effect/Effect";

const processUserDocuments = (userId: string) =>
  runServerPromise(
    Effect.gen(function* () {
      const { users } = yield* IamRepos.IamRepos;
      const { documents } = yield* DocumentsRepos.DocumentsRepos;

      const user = yield* users.findById(userId);
      const docs = yield* documents.findByOwnerId(userId);

      yield* Effect.logInfo("documents.processed", {
        userId,
        documentCount: docs.length
      });

      return { user, documents: docs };
    }),
    "user.documents.process"
  );
```

### Using Exit Values for Error Handling

Capture full Exit results for granular error handling:

```typescript
import { runServerPromiseExit } from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";

export async function POST(request: Request) {
  const exit = await runServerPromiseExit(
    Effect.gen(function* () {
      // Your effect logic here
      yield* Effect.fail(new Error("Something went wrong"));
    }),
    "api.post.handler"
  );

  if (Exit.isFailure(exit)) {
    const error = Exit.causeFailureOption(exit.cause);
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }

  return Response.json(Exit.getOrNull(exit));
}
```

### HTTP Middleware and Routing

Use the provided HTTP infrastructure for consistent logging and CORS:

```typescript
import { HealthRouter } from "@beep/runtime-server/HealthRouter";
import { CorsLive } from "@beep/runtime-server/Cors";
import { httpLogger } from "@beep/runtime-server/Logging";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as Layer from "effect/Layer";

// Compose routers with CORS and logging
export const apiRouter = HttpLayerRouter.use((router) =>
  router
    .add("GET", "/api/users", getUsersHandler)
    .add("POST", "/api/users", createUserHandler)
).pipe(
  Layer.provideMerge(CorsLive),
  Layer.provide(httpLogger)
);

// Health check is available out-of-the-box
const appRouter = Layer.mergeAll(HealthRouter, apiRouter);
```

### RPC Logging

For RPC-based communication, use the RPC logger middleware:

```typescript
import { RpcLoggerLive } from "@beep/runtime-server/Logging";
import * as RpcRouter from "@effect/rpc/RpcRouter";
import * as Layer from "effect/Layer";

const rpcRouter = RpcRouter.make(/* your handlers */).pipe(
  Layer.provide(RpcLoggerLive)
);
```

### Environment Configuration

The runtime automatically configures based on environment variables:

```typescript
// Environment variables (via @beep/shared-server/ServerEnv):
// - APP_ENV: dev, staging, production
// - APP_LOG_LEVEL: trace, debug, info, warn, error, fatal
// - SERVICE_NAME: beep-server (default)
// - OTLP_TRACE_EXPORTER_URL: https://otlp.example.com/v1/traces
// - OTLP_LOG_EXPORTER_URL: https://otlp.example.com/v1/logs
// - OTLP_METRIC_EXPORTER_URL: https://otlp.example.com/v1/metrics
// - TRUSTED_ORIGINS: Comma-separated list of allowed CORS origins

// The runtime will:
// - Use pretty console logging in dev, JSON in production
// - Enable Effect DevTools in dev only
// - Export traces/logs/metrics to configured OTLP endpoints
// - Set appropriate log levels based on environment
// - Configure CORS with trusted origins
```

## What Belongs Here

- **ManagedRuntime configuration** for server-side Effect execution
- **Observability layers**: logging, tracing, metrics, dev tools
- **Service aggregation**: combining slice services into a single runtime
- **Execution helpers**: `runServerPromise`, `runServerPromiseExit` with automatic span wrapping
- **Environment-sensitive configuration**: dev vs. prod behavior

## What Must NOT Go Here

- **Domain logic**: business rules belong in slice `domain` packages
- **Application workflows**: orchestration belongs in slice `application` or `api` layers
- **Route handlers**: HTTP handlers belong in `apps/web/src/app/api/*`
- **Client-side runtime**: use `@beep/runtime-client` for browser contexts
- **Database migrations**: migrations live in `packages/_internal/db-admin`

This package is infrastructure-only, providing the runtime foundation for executing domain and application logic.

## Dependencies

| Package                      | Purpose                                          |
|------------------------------|--------------------------------------------------|
| `effect`                     | Core Effect runtime system                      |
| `@effect/platform`           | Platform abstractions (HTTP, RPC)                |
| `@effect/platform-bun`       | Bun-specific platform implementations            |
| `@effect/rpc`                | RPC router and middleware                        |
| `@effect/opentelemetry`      | OpenTelemetry integration for Effect            |
| `@effect/experimental`       | Effect DevTools for development                  |
| `@beep/shared-server`         | Shared infrastructure (Db, Email, Config, Repos) |
| `@beep/iam-server`            | IAM repositories and Better Auth service         |
| `@beep/documents-server`      | Documents repositories and storage service       |
| `@beep/errors`               | Logging utilities and error schemas              |
| `@beep/constants`            | Schema-backed constants (AllowedHeaders, etc.)   |
| `@beep/schema`               | Schema utilities (HttpMethod, etc.)              |
| `@opentelemetry/*`           | OpenTelemetry exporters and SDK                  |

## Development

```bash
# Type check
bun run --filter @beep/runtime-server check

# Lint
bun run --filter @beep/runtime-server lint

# Lint and auto-fix
bun run --filter @beep/runtime-server lint:fix

# Build
bun run --filter @beep/runtime-server build

# Run tests
bun run --filter @beep/runtime-server test

# Test with coverage
bun run --filter @beep/runtime-server coverage
```

## Guidelines for Extending the Runtime

### Adding New Domain Slices

When adding a new domain slice to the runtime:

1. **Create slice layers** in the slice's `infra` package:
   ```typescript
   // packages/new-slice/server/db/index.ts
   export const NewSliceDb = Layer.effect(/* ... */);

   // packages/new-slice/server/repos/index.ts
   export const NewSliceRepos = Layer.effect(/* ... */);
   ```

2. **Add to SliceDatabaseClientsLive** in `src/Slices.ts`:
   ```typescript
   export const SliceDatabaseClientsLive: SliceDatabaseClientsLive = Layer.mergeAll(
     IamDb.IamDb.Live,
     DocumentsDb.DocumentsDb.Live,
     SharedDb.SharedDb.Live,
     NewSliceDb.NewSliceDb.Live  // Add here
   );
   ```

3. **Add to SliceReposLive** in `src/Slices.ts`:
   ```typescript
   export const SliceReposLive: SliceReposLive = Layer.mergeAll(
     IamRepos.layer,
     DocumentsRepos.layer,
     SharedRepos.layer,
     NewSliceRepos.layer  // Add here
   ).pipe(Layer.orDie);
   ```

4. **Update type unions** in `Slices.ts`:
   ```typescript
   export type SliceDatabaseClients =
     | DocumentsDb.DocumentsDb
     | IamDb.IamDb
     | SharedDb.SharedDb
     | NewSliceDb.NewSliceDb;  // Add here

   type SliceRepositories =
     | DocumentsRepos.DocumentsRepos
     | IamRepos.IamRepos
     | SharedRepos.SharedRepos
     | NewSliceRepos.NewSliceRepos;  // Add here
   ```

### Adding Observability Layers

Extend logging or tracing with additional processors:

```typescript
// src/Tracing.ts
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

export const TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: otlpTraceExporterUrl })
  ),
  // Add additional processors as needed
}));
```

### Respecting Environment Toggles

Always check environment configuration before adding dev-only features:

```typescript
import * as Bool from "effect/Boolean";
import * as Layer from "effect/Layer";
import { isDevEnvironment } from "./Environment";

export const NewDevToolLive = Bool.match(isDevEnvironment, {
  onTrue: () => /* dev implementation */,
  onFalse: () => Layer.empty
});
```

### Effect Pattern Requirements

- **Namespace imports**: `import * as Effect from "effect/Effect"`, `import * as Layer from "effect/Layer"`
- **No native arrays/strings**: Use `A.*` and `Str.*` from Effect utilities
- **Tagged errors**: Use `Schema.TaggedError` from `effect/Schema`
- **Layer composition**: Prefer `Layer.mergeAll` and `Layer.provideMerge`
- **Memoization**: Keep layers pure for build cache reuse

## Telemetry and Observability

### Tracing

Every `runServerPromise` call automatically wraps effects with `Effect.withSpan`, creating distributed traces:

```typescript
// Automatic span creation
runServerPromise(myEffect, "custom.span.name");

// Nested spans are captured automatically
Effect.gen(function* () {
  yield* Effect.withSpan(subTask, "sub.task");  // Child span
  yield* Effect.withSpan(anotherTask, "another.task");  // Sibling span
});
```

### Logging

Structured logging with JSON output in production:

```typescript
Effect.gen(function* () {
  yield* Effect.logInfo("operation.started", { userId, operation: "upload" });
  yield* Effect.logDebug("processing.file", { fileName, size });
  yield* Effect.logError("upload.failed", { error: cause });
});
```

### Metrics

OpenTelemetry metrics are exported to the configured OTLP endpoint automatically.

## Known Issues and Limitations

- **server-runtime.ts is deprecated**: The `src/server-runtime.ts` file exists only for backwards compatibility. All imports should use `@beep/runtime-server` directly, which re-exports from `Runtime.ts`
- **Single runtime instance**: The `serverRuntime` is a singleton ManagedRuntime; do not create multiple instances within the same process
- **No browser support**: This runtime is server-only; use `@beep/runtime-client` for browser contexts
- **Environment must be configured**: Missing OTLP URLs or invalid log levels will cause runtime failures. Ensure environment variables are properly set via `@beep/shared-server/ServerEnv`
- **Wildcard exports**: Internal layers are accessible via wildcard exports (e.g., `@beep/runtime-server/App`). These are semi-internal and may change. Prefer using the main runtime exports when possible

## Relationship to Other Packages

- `@beep/runtime-client` — Browser equivalent with TanStack Query integration
- `@beep/shared-server` — Provides Db, Email, and Config layers consumed by this runtime
- `@beep/iam-server` — Provides AuthService and IAM repositories
- `@beep/documents-server` — Provides Documents repositories and storage
- `@beep/errors` — Provides logging utilities and error schemas
- `apps/web` — Consumes this runtime in API routes and server components
- `apps/server` — Uses this runtime as the foundation for the backend service

## Testing

- Use Vitest for unit tests
- Test layer composition and service availability
- Mock environment variables for different configurations
- Tests located in `test/` directory

## Versioning and Changes

- Critical infrastructure package — **test thoroughly** before changes
- Breaking changes require coordinating updates across `apps/web` and `apps/server`
- For new slice integrations, update this README with integration examples
- Document any new environment variables or configuration options
