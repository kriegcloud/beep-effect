# @beep/runtime-server

Production-grade Effect ManagedRuntime for server-side applications with observability, persistence, and authentication.

## Purpose

Provides the production-grade Effect runtime that powers all server-side entry points in the beep-effect monorepo. This package bundles observability (logging, tracing, metrics), persistence (database clients, repositories), authentication, and domain services (IAM, Documents) into a single, cohesive ManagedRuntime that ensures consistent telemetry, dependency injection, and error handling across all server contexts.

Acts as the shared runtime for API routes (`apps/web/src/app/api/*`), background jobs, and any Bun/Node hosts, eliminating the need for applications to manually wire up layers.

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

### Layer Exports (via wildcard exports)

Access these via `@beep/runtime-server/ModuleName`:

| Export                  | Module           | Description                                                           |
|-------------------------|------------------|-----------------------------------------------------------------------|
| `Authentication.layer`  | `Authentication` | Auth service layer with email and data access dependencies            |
| `Authentication.Services` | `Authentication` | Type union of Auth, Email, and DataAccess services                  |
| `DataAccess.layer`      | `DataAccess`     | Repository layers (IAM, Documents, Shared) with persistence          |
| `DataAccess.Services`   | `DataAccess`     | Type union of all repositories and persistence services              |
| `Persistence.layer`     | `Persistence`    | Database clients (IAM, Documents, Shared), S3, and Upload service    |
| `Persistence.Services`  | `Persistence`    | Type union of all database clients and storage services              |
| `Persistence.DbClients` | `Persistence`    | Type union of SharedDb, IamDb, DocumentsDb                           |
| `HttpRouter.layer`      | `HttpRouter`     | Complete HTTP routing with middleware, CORS, and authentication      |
| `Server.layer`          | `Server`         | Root server layer composition (HTTP router + Bun server + infra)     |
| `Tracer.layer`          | `Tracer`         | OpenTelemetry exporters for traces, logs, metrics                    |
| `Tracer.Tracing`        | `Tracer`         | OpenTelemetry Resource type                                          |
| `Tooling.layer`         | `Tooling`        | Dev tools (Effect DevTools) and tracing infrastructure               |
| `Tooling.Services`      | `Tooling`        | Type union of tooling services (Tracing)                             |
| `Tooling.devToolsLayer` | `Tooling`        | Dev-only Effect DevTools layer (environment-sensitive)               |
| `AuthContext.layer`     | `AuthContext`    | Complete auth context with RPC/HTTP middlewares and Authentication   |
| `AuthContext.Services`  | `AuthContext`    | Type union of auth context middlewares and Authentication.Services   |
| `AuthContext.AuthContextLayer` | `AuthContext` | Per-request AuthContext layer (extracts from HttpServerRequest) |
| `AuthContext.authContextMiddlewareLayer` | `AuthContext` | Combined RPC/HTTP middleware layer |
| `AuthContext.AuthContextRpcMiddlewaresLayer` | `AuthContext` | RPC-specific auth middleware |
| `AuthContext.AuthContextHttpMiddlewaresLayer` | `AuthContext` | HTTP-specific auth middleware |
| `Rpc.layer`             | `Rpc`            | RPC routing layer for `/v1/shared/rpc` endpoint (WebSocket)          |
| `Rpc.RpcLogger`         | `Rpc`            | RPC middleware for logging failed requests                           |
| `Rpc.RpcLoggerLive`     | `Rpc`            | Live implementation of RPC logger middleware                         |
| `Email.layer`           | `Email`          | Email service layer (Resend)                                         |
| `Email.Services`        | `Email`          | Email service types (ResendService)                                  |

### Middleware Export (direct import required)

| Export             | Module    | Description                                            |
|--------------------|-----------|--------------------------------------------------------|
| `httpLogger`       | `Logger`  | HTTP middleware for structured request/response logging |

**Note**: `Logger` is not exported via wildcard in `index.ts`. Import `httpLogger` directly from the source file:
```typescript
import { httpLogger } from "@beep/runtime-server/Logger.layer";
```

## Architecture Fit

- **Layer-Based Composition**: Each module provides a focused Layer that composes cleanly with others
- **Vertical Slice + Hexagonal**: Aggregates infrastructure adapters from multiple slices while keeping domain logic pure
- **Observability-first**: Every execution is traced with OpenTelemetry spans and structured logging
- **Dependency Injection**: Uses Effect Layers to provide all services without manual wiring
- **Environment-aware**: Automatically configures logging, tracing, and dev tools based on environment variables
- **Path alias**: Import as `@beep/runtime-server`

## Module Structure

```
src/
├── index.ts                    # Public exports (runServerPromise, serverRuntime, layer namespaces)
├── Runtime.ts                  # ManagedRuntime and execution helpers
├── Server.layer.ts             # Root server layer composition
├── Authentication.layer.ts     # Auth service with dependencies
├── DataAccess.layer.ts         # Repository aggregation layer
├── Persistence.layer.ts        # Database clients and storage infrastructure
├── HttpRouter.layer.ts         # HTTP routing, CORS, middleware, authentication
├── Tracer.layer.ts             # OpenTelemetry configuration
├── Tooling.layer.ts            # Effect DevTools + Tracer composition
├── Logger.layer.ts             # HTTP logging middleware (httpLogger export)
├── AuthContext.layer.ts        # Auth context middleware
├── Rpc.layer.ts                # RPC routing
├── Email.layer.ts              # Email services (Resend)
└── AccessControl.layer.ts      # (Currently empty placeholder)
```

## Layer Composition Hierarchy

```
serverRuntime (ManagedRuntime)
  └── Authentication.layer
      ├── Auth.layer (@beep/iam-server)
      ├── Email.layer (ResendService)
      └── DataAccess.layer
          ├── IamRepos.layer
          ├── DocumentsRepos.layer
          ├── SharedRepos.layer
          └── Persistence.layer
              ├── SharedDb.layer
              ├── IamDb.layer
              ├── DocumentsDb.layer
              ├── Upload.layer
              ├── Db.layer (SliceDbRequirements)
              └── S3Service.defaultLayer

Server.layer (for full HTTP server)
  └── HttpRouter.layer
      ├── ProtectedRoutes (with AuthContext.layer)
      │   ├── IamApiRoutes (HttpApi + IamApiLive handlers)
      │   └── Rpc.layer (RPC WebSocket endpoint at /v1/shared/rpc)
      ├── PublicRoutes
      │   ├── DocsRoute (Swagger/Scalar at /v1/docs)
      │   └── HealthRoute (GET /v1/health)
      ├── CorsMiddleware (trusted origins, allowed methods/headers)
      └── Logger.httpLogger (HTTP middleware with structured logging)
  ├── BunHttpServer.layer (port from serverEnv.app.api.port)
  ├── FetchHttpClient.layer
  ├── HttpServer.layerContext
  ├── Logger.minimumLogLevel (from serverEnv.app.logLevel)
  ├── Persistence.layer
  └── Tooling.layer
      ├── Tooling.devToolsLayer (Effect DevTools via WebSocket, dev only)
      └── Tracer.layer (OTLP trace/log/metric exporters)
```

## Usage

### Basic Server Effect Execution

Execute server-side effects with automatic observability:

```typescript
import { runServerPromise } from "@beep/runtime-server";
import { Auth } from "@beep/iam-server";
import * as Effect from "effect/Effect";

export async function POST(request: Request) {
  const result = await runServerPromise(
    Effect.gen(function* () {
      const { auth } = yield* Auth.Service;
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
import { Authentication } from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

// Define a custom service
class JobQueue extends Context.Tag("JobQueue")<
  JobQueue,
  { readonly enqueue: (job: string) => Effect.Effect<void> }
>() {}

// Implement the service
const JobQueueLive = Layer.succeed(JobQueue, {
  enqueue: (job: string) =>
    Effect.logInfo("job.enqueued", { job })
});

// Create runtime with both Authentication and JobQueue services
export const jobRuntime = ManagedRuntime.make(
  Layer.mergeAll(JobQueueLive, Authentication.layer)
);

// Use the runtime with automatic span tracing
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

### Building a Full HTTP Server

Use the complete server layer to run a standalone HTTP server:

```typescript
import { Server } from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";

const runtime = ManagedRuntime.make(Server.layer);

// Server will start on the configured port
// Routes are available at:
// - GET /v1/health
// - GET /v1/docs (Swagger/Scalar)
// - GET /v1/docs/openapi.json
// - WebSocket /v1/shared/rpc (RPC endpoint)
// - All IAM API routes under /v1/*

await runtime.runPromise(
  Effect.gen(function* () {
    yield* Effect.logInfo("Server started successfully");
    // Server keeps running until interrupted
  })
);
```

### Accessing HTTP Logging Middleware

Use the HTTP logger in custom routes:

```typescript
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Layer from "effect/Layer";

// Note: Logger is not a namespace export, import httpLogger directly
import { httpLogger } from "@beep/runtime-server/Logger.layer";

const customRouter = HttpLayerRouter.use((router) =>
  router.add("GET", "/api/custom", HttpServerResponse.text("Custom route"))
);

// Serve with HTTP logging middleware
const routerLayer = HttpLayerRouter.serve(customRouter, {
  middleware: httpLogger,
  disableLogger: false,
});
```

### Environment Configuration

The runtime automatically configures based on environment variables:

```typescript
// Environment variables (via @beep/shared-env/ServerEnv):
// - APP_ENV: dev, staging, production
// - APP_LOG_LEVEL: trace, debug, info, warn, error, fatal
// - APP_NAME: beep (default, used for service name: "beep-server")
// - APP_API_PORT: Server port (default: 3001)
// - OTLP_TRACE_EXPORTER_URL: https://otlp.example.com/v1/traces
// - OTLP_LOG_EXPORTER_URL: https://otlp.example.com/v1/logs
// - OTLP_METRIC_EXPORTER_URL: https://otlp.example.com/v1/metrics
// - TRUSTED_ORIGINS: Comma-separated list of allowed CORS origins

// The runtime will:
// - Use configured log level via Logger.minimumLogLevel
// - Enable Effect DevTools in dev only
// - Export traces/logs/metrics to configured OTLP endpoints
// - Set service name to "{APP_NAME}-server"
// - Configure CORS with trusted origins
```

## What Belongs Here

- **ManagedRuntime configuration** for server-side Effect execution
- **Layer composition** combining infrastructure services
- **Execution helpers**: `runServerPromise`, `runServerPromiseExit` with automatic span wrapping
- **HTTP server setup** with routing, middleware, and observability
- **Environment-sensitive configuration**: dev vs. prod behavior

## What Must NOT Go Here

- **Domain logic**: business rules belong in slice `domain` packages
- **Application workflows**: orchestration belongs in slice `server` or `api` layers
- **Route handlers**: specific HTTP endpoint implementations belong in service layers or `apps/web/src/app/api/*`
- **Client-side runtime**: use `@beep/runtime-client` for browser contexts
- **Database migrations**: migrations live in `packages/_internal/db-admin`
- **Repository implementations**: repositories are in `@beep/iam-server`, `@beep/documents-server`, `@beep/shared-server`

This package is infrastructure-only, providing the runtime foundation for executing domain and application logic.

## Dependencies

### Core Effect Dependencies

| Package                      | Purpose                                          |
|------------------------------|--------------------------------------------------|
| `effect`                     | Core Effect runtime system                      |
| `@effect/platform`           | Platform abstractions (HTTP, RPC)                |
| `@effect/platform-bun`       | Bun-specific platform implementations            |
| `@effect/rpc`                | RPC router and middleware                        |
| `@effect/opentelemetry`      | OpenTelemetry integration for Effect            |
| `@effect/experimental`       | Effect DevTools for development                  |

### Infrastructure Dependencies

| Package                      | Purpose                                          |
|------------------------------|--------------------------------------------------|
| `@effect-aws/client-s3`      | S3 client service for file storage (via S3Service) |
| `@opentelemetry/exporter-trace-otlp-http` | OTLP trace exporter                |
| `@opentelemetry/exporter-logs-otlp-http` | OTLP log exporter                  |
| `@opentelemetry/exporter-metrics-otlp-proto` | OTLP metrics exporter           |
| `@opentelemetry/sdk-trace-base` | Trace SDK (BatchSpanProcessor)              |
| `@opentelemetry/sdk-logs`    | Log SDK (BatchLogRecordProcessor)                |
| `@opentelemetry/sdk-metrics` | Metrics SDK (PeriodicExportingMetricReader)      |

### Monorepo Dependencies

| Package                      | Purpose                                          |
|------------------------------|--------------------------------------------------|
| `@beep/shared-env`            | Environment configuration (ServerEnv)            |
| `@beep/shared-server`         | Shared infrastructure (Db, Email, Repos)         |
| `@beep/shared-domain`         | Shared domain models                            |
| `@beep/shared-tables`         | Shared table schemas                            |
| `@beep/iam-server`            | IAM repositories and Better Auth service         |
| `@beep/iam-domain`            | IAM API contracts (IamApi HttpApi)              |
| `@beep/iam-tables`            | IAM table schemas                               |
| `@beep/documents-server`      | Documents repositories and storage service       |
| `@beep/documents-domain`      | Documents domain models                         |
| `@beep/documents-tables`      | Documents table schemas                         |
| `@beep/constants`            | Schema-backed constants (AllowedHeaders, EnvValue) |
| `@beep/schema`               | Schema utilities (HttpMethod, BS namespace)      |
| `@beep/errors`               | Error definitions and logging                    |
| `@beep/identity`             | Package identity utilities                       |
| `@beep/invariant`            | Assertion contracts                             |
| `@beep/utils`                | Effect utilities and helpers                    |

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

# Check circular dependencies
bun run --filter @beep/runtime-server lint:circular
```

## Guidelines for Extending the Runtime

### Adding New Domain Slices

When adding a new domain slice to the runtime:

1. **Create database layer** in the slice's `server/db` package:
   ```typescript
   // packages/new-slice/server/db/index.ts
   export const NewSliceDb = Layer.effect(/* ... */);
   ```

2. **Create repository layer** in the slice's `server` package:
   ```typescript
   // packages/new-slice/server/repos/index.ts
   export const NewSliceRepos = Layer.effect(/* ... */);
   ```

3. **Add to Persistence.layer** in `src/Persistence.layer.ts`:
   ```typescript
   import { NewSliceDb } from "@beep/new-slice-server/db";

   export type DbClients =
     | SharedDb.SharedDb
     | IamDb.IamDb
     | DocumentsDb.DocumentsDb
     | NewSliceDb.NewSliceDb;  // Add here

   const sliceClientsLayer: Layer.Layer<DbClients | Upload.Service, never, Db.SliceDbRequirements | S3Service> =
     Layer.mergeAll(
       SharedDb.layer,
       IamDb.layer,
       DocumentsDb.layer,
       NewSliceDb.layer,  // Add here
       Upload.layer
     );
   ```

4. **Add to DataAccess.layer** in `src/DataAccess.layer.ts`:
   ```typescript
   import { NewSliceRepos } from "@beep/new-slice-server";

   type SliceRepos =
     | IamRepos.IamRepos
     | DocumentsRepos.DocumentsRepos
     | SharedRepos.SharedRepos
     | NewSliceRepos.NewSliceRepos;  // Add here

   const sliceReposLayer: Layer.Layer<SliceRepos, never, Persistence.Services> =
     Layer.mergeAll(
       IamRepos.layer,
       DocumentsRepos.layer,
       SharedRepos.layer,
       NewSliceRepos.layer  // Add here
     );
   ```

### Adding HTTP Routes

Extend HTTP routing by modifying `src/HttpRouter.layer.ts`:

```typescript
import { NewSliceApi } from "@beep/new-slice-domain";
import { NewSliceApiLive } from "@beep/new-slice-server";

const NewSliceApiRoutes = HttpLayerRouter.addHttpApi(NewSliceApi, {
  openapiPath: "/v1/new-slice/openapi.json",
}).pipe(
  Layer.provideMerge(NewSliceApiLive)
);

// Add to ProtectedRoutes or PublicRoutes
const ProtectedRoutes = Layer.mergeAll(
  IamApiRoutes,
  Rpc.layer,
  NewSliceApiRoutes  // Add here
).pipe(Layer.provide(AuthContext.layer));
```

### Customizing Observability

Extend tracing configuration in `src/Tracer.layer.ts`:

```typescript
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

export const layer: TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: otlpTraceExporterUrl })
  ),
  // Add additional processors as needed
}));
```

### Adding Dev Tools

Check environment before adding dev-only features in `src/Tooling.layer.ts`:

```typescript
import { EnvValue } from "@beep/constants";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";

export const newDevToolLayer = Bool.match(
  EnvValue.is.dev(serverEnv.app.env),
  {
    onTrue: F.constant(/* dev implementation */),
    onFalse: F.constant(Layer.empty)
  }
);
```

### Effect Pattern Requirements

- **Namespace imports**: `import * as Effect from "effect/Effect"`, `import * as Layer from "effect/Layer"`
- **No native arrays/strings**: Use `A.*` and `Str.*` from Effect utilities
- **Tagged errors**: Use `Schema.TaggedError` from `effect/Schema`
- **Layer composition**: Prefer `Layer.mergeAll` and `Layer.provideMerge`
- **Memoization**: Keep layers pure for build cache reuse
- **No native Date**: Use `effect/DateTime` for all date/time operations
- **Pattern matching**: Use `effect/Match` instead of switch statements

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

HTTP requests automatically create spans with format `http {METHOD} {PATH}`, with special handling to disable tracing for OPTIONS requests and health checks.

### Logging

Structured logging with JSON output in production:

```typescript
Effect.gen(function* () {
  yield* Effect.logInfo("operation.started", { userId, operation: "upload" });
  yield* Effect.logDebug("processing.file", { fileName, size });
  yield* Effect.logError("upload.failed", { error: cause });
});
```

The log level is configured via `APP_LOG_LEVEL` environment variable and applied through `Logger.minimumLogLevel` in the server layer.

### Metrics

OpenTelemetry metrics are exported to the configured OTLP endpoint automatically via the `PeriodicExportingMetricReader` in `Tracer.layer`.

## Known Issues and Limitations

- **Single runtime instance**: The `serverRuntime` is a singleton ManagedRuntime; do not create multiple instances within the same process
- **No browser support**: This runtime is server-only; use `@beep/runtime-client` for browser contexts
- **Environment must be configured**: Missing OTLP URLs or invalid log levels may affect observability. Ensure environment variables are properly set via `@beep/shared-env/ServerEnv`
- **Wildcard exports**: Layer modules are accessible via wildcard exports (e.g., `@beep/runtime-server/Authentication`). These are part of the public API but may have breaking changes in major versions
- **AccessControl.layer is empty**: The `AccessControl.layer.ts` file exists but is currently a placeholder
- **RPC path mismatch**: The `Rpc.layer` is configured for `/v1/shared/rpc` (WebSocket), but `HttpRouter.layer.ts` disables tracing for `/v1/documents/rpc`. This means the actual RPC endpoint at `/v1/shared/rpc` will have tracing enabled, while the hardcoded `/v1/documents/rpc` path (which may not exist) won't be traced

## Relationship to Other Packages

- `@beep/runtime-client` — Browser equivalent with TanStack Query integration
- `@beep/shared-env` — Provides ServerEnv configuration consumed by this runtime
- `@beep/shared-server` — Provides Db, Email, and Repo layers consumed by this runtime
- `@beep/iam-server` — Provides Auth service and IAM repositories
- `@beep/iam-domain` — Provides IAM API contract (HttpApi)
- `@beep/documents-server` — Provides Documents repositories and storage
- `apps/web` — Consumes this runtime in API routes and server components
- `apps/server` — Uses this runtime as the foundation for the backend service

## Testing

- Use Vitest for unit tests via `bun test`
- Test layer composition and service availability
- Mock environment variables for different configurations
- Tests should be located in `test/` directory (currently minimal)

## Versioning and Changes

- Critical infrastructure package — **test thoroughly** before changes
- Breaking changes require coordinating updates across `apps/web` and `apps/server`
- For new slice integrations, update this README with integration examples
- Document any new environment variables or configuration options
- Update AGENTS.md with new surface map entries when adding exports
