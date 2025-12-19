---
name: server-runtime-v1-layers
version: 2
created: 2025-12-13T00:00:00Z
iterations: 1
---

# Server Runtime V1 Layers - Refined Prompt

## Context

You are working in the `beep-effect` monorepo, an Effect-first full-stack application. The server runtime package (`packages/runtime/server/`) currently has a flat layer structure that needs to be replaced with a well-organized V1 architecture at `packages/runtime/server/src/v1/`.

### Current State

**Existing V1 layers** (already created, well-structured):
- `AuthContext.layer.ts` - HTTP/RPC middleware for auth context extraction
- `Authentication.layer.ts` - BetterAuth service + Email + DataAccess composition
- `DataAccess.layer.ts` - All slice repositories (IAM, Documents, Shared)
- `Email.layer.ts` - AuthEmailService with Resend provider
- `Persistence.layer.ts` - Database clients (SharedDb, IamDb, DocumentsDb) + S3
- `Tooling.layer.ts` - Currently empty, reserved for development utilities

**Legacy code to replace** (in `packages/runtime/server/src/`):
- `App.ts` - Master layer composition
- `Logging.ts` - Pretty/JSON logger + HTTP/RPC middleware loggers
- `Tracing.ts` - OpenTelemetry OTLP exporters
- `DevTools.ts` - Dev-only WebSocket debugging
- `CoreServices.ts` - Email + auth infrastructure
- `Slices.ts` - All slice services
- `HealthRouter.ts` - Basic health check route
- `Cors.ts` - CORS configuration

**Server entry point** (`apps/server/src/server.ts`):
- Uses `@effect/platform` with Bun HTTP Server
- `HttpApiBuilder` for OpenAPI documentation
- CORS via `HttpMiddleware.cors`
- Basic `/api/health` text endpoint
- Fixed port 8080

### Technology Stack
- **Runtime**: Bun 1.3.x, Effect 3
- **HTTP**: `@effect/platform-bun`, `HttpApiBuilder`
- **RPC**: `@effect/rpc` with WebSocket + NDJSON
- **Telemetry**: `@effect/opentelemetry`, OTLP exporters to Grafana
- **Database**: PostgreSQL via `@effect/sql-pg`, Drizzle ORM
- **Auth**: better-auth with Redis session storage

### Migration Goal
Replace all legacy layer code with V1 architecture to enable:
1. Moving `better-auth` to a separate server from `apps/web`
2. Standalone `@effect/platform` & `@effect/rpc` API server
3. Clean separation of concerns with modular, testable layers

---

## Objective

Design and implement production-grade **telemetry, observability, logging, HTTP, and DevTools layers** for the V1 architecture with the following measurable outcomes:

### Primary Deliverables

1. **Observability Layers** (`v1/observability/`)
   - `Telemetry.layer.ts` - OTLP export for traces, logs, metrics
   - `Logging.layer.ts` - Environment-aware console logging (pretty/JSON)
   - `DevTools.layer.ts` - Dev-only Effect DevTools integration

2. **HTTP Infrastructure Layers** (`v1/http/`)
   - `HttpServer.layer.ts` - Server configuration, middleware composition
   - `HealthCheck.layer.ts` - Liveness + readiness probes with dependency checks
   - `Cors.layer.ts` - CORS configuration from environment
   - `ErrorHandler.layer.ts` - Global error response mapping

3. **Resilience Layers** (`v1/resilience/`)
   - `GracefulShutdown.layer.ts` - Connection draining, cleanup hooks

4. **Tooling Layer** (`v1/Tooling.layer.ts`)
   - Composes exactly: `Telemetry.layer` + `Logging.layer` + `DevTools.layer` + `RequestContext.layer`
   - Environment-based configuration (dev vs prod switching)
   - Single import point for all observability infrastructure
   - Does NOT include HTTP, resilience, or business layers

5. **Barrel Export** (`v1/index.ts`)
   - Export all layers with proper types
   - Provide pre-composed application layers

### Success Criteria
- [ ] All layers compile with `bun run check --filter @beep/server-runtime`
- [ ] No lint errors with `bun run lint --filter @beep/server-runtime`
- [ ] Health check returns structured JSON with dependency status
- [ ] Telemetry exports to OTLP endpoints successfully
- [ ] Graceful shutdown completes in-flight requests
- [ ] Request correlation IDs propagate through logs and spans
- [ ] Dev vs prod logging behavior correctly switches

---

## Role

You are a **senior Effect ecosystem architect** with deep expertise in:
- `@effect/opentelemetry` configuration and OTLP export patterns
- `@effect/platform` HTTP server middleware composition
- Effect Layer dependency injection and composition patterns
- Production observability (distributed tracing, structured logging, metrics)
- Graceful shutdown and resilience patterns

You prioritize:
- Type safety and compile-time guarantees
- Testability through dependency injection
- Clear separation of concerns
- Production-ready defaults with dev ergonomics

---

## Constraints

### Absolute Requirements (from AGENTS.md)

**Effect-First Patterns**:
```typescript
// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as DateTime from "effect/DateTime";
```

**Forbidden Patterns**:
```typescript
// NEVER use these:
items.map()           // Use A.map
items.filter()        // Use A.filter
str.split()           // Use Str.split
Object.keys()         // Use Struct.keys
switch (x) {}         // Use Match.exhaustive
typeof x === "string" // Use P.isString
new Date()            // Use DateTime.unsafeNow
async/await           // Use Effect.tryPromise
process.env.FOO       // Use Effect Config via serverEnv
console.log()         // Use Effect.logInfo with structured data
```

**Layer Naming**:
- Files: `*.layer.ts`
- Primary export: `layer` (lowercase)
- Type export: `Services` (union of provided services)
- Live implementations: `*Live` suffix

**Error Handling**:
- Use `S.TaggedError` from `effect/Schema`
- All errors must have HTTP status annotations
- Use `BeepError.*` from `@beep/errors`

**Logging Requirements**:
- Structured logging: `Effect.logInfo("event.name", { key: value })`
- Context attachment: `Effect.annotateLogs({ field: value })`
- Never log secrets, passwords, or PII
- Use `Redacted<string>` for sensitive configuration

**Environment Configuration**:
- Read from `@beep/shared-infra/ServerEnv`
- Access via `serverEnv.app.*`, `serverEnv.otlp.*`, etc.
- Never access `process.env` or `Bun.env` directly

### Architectural Constraints

**Layer Composition Order** (bottom-up):
```
Infrastructure (Telemetry, Logging)
    ↓
Persistence (Database, S3, Redis)
    ↓
Repositories (Data Access)
    ↓
Services (Business Logic, Auth)
    ↓
Application (HTTP Server, RPC, Middleware)
```

**Dependency Injection**:
- Use `Layer.provide` to hide internal dependencies
- Use `Layer.provideMerge` to expose shared infrastructure
- Use `Layer.mergeAll` for independent sibling layers
- Use `Layer.scoped` for resources requiring cleanup

---

## Resources

### Files to Read (Reference Implementations)

**Current Implementation** (patterns to follow):
- `packages/runtime/server/src/Logging.ts` - HTTP/RPC logger middleware
- `packages/runtime/server/src/Tracing.ts` - OTLP exporter setup
- `packages/runtime/server/src/DevTools.ts` - DevTools integration
- `packages/runtime/server/src/App.ts` - Layer composition pattern

**V1 Layers** (established patterns):
- `packages/runtime/server/src/v1/Persistence.layer.ts` - Infrastructure pattern
- `packages/runtime/server/src/v1/DataAccess.layer.ts` - Repository pattern
- `packages/runtime/server/src/v1/Authentication.layer.ts` - Service composition
- `packages/runtime/server/src/v1/AuthContext.layer.ts` - Middleware pattern

**Shared Infrastructure**:
- `packages/shared/infra/src/ServerEnv.ts` - Environment configuration
- `packages/common/errors/src/server/` - Pretty logger, cause formatting

**Server Entry Point**:
- `apps/server/src/server.ts` - Current HTTP server setup

### Documentation to Consult

**Effect Packages** (via Context7 MCP):
- `@effect/opentelemetry` - NodeSdk, Otlp layers, Resource configuration
- `@effect/platform` - HttpServer, HttpMiddleware, HttpServerRequest
- `effect` - Logger, Layer, ManagedRuntime, Config

**Research Document**:
- `docs/research/production-telemetry-http-layers.md` - Effect researcher findings

### Package AGENTS.md Files
- `packages/runtime/server/AGENTS.md`
- `packages/shared/infra/AGENTS.md`
- `packages/common/errors/AGENTS.md`

---

## Output Specification

### File Structure
```
packages/runtime/server/src/v1/
├── observability/
│   ├── Telemetry.layer.ts       # OTLP export (traces, logs, metrics)
│   ├── Logging.layer.ts         # Console logger (pretty dev / JSON prod)
│   ├── DevTools.layer.ts        # Effect DevTools (dev only)
│   └── RequestContext.layer.ts  # Correlation ID propagation
├── http/
│   ├── HttpServer.layer.ts      # Server config, middleware composition
│   ├── HealthCheck.layer.ts     # Liveness + readiness probes
│   ├── Cors.layer.ts            # CORS from environment
│   └── ErrorHandler.layer.ts    # Global error response mapping
├── resilience/
│   └── GracefulShutdown.layer.ts  # Connection draining, cleanup
├── Tooling.layer.ts             # Merges: Telemetry + Logging + DevTools + RequestContext
├── AuthContext.layer.ts         # (existing)
├── Authentication.layer.ts      # (existing)
├── DataAccess.layer.ts          # (existing)
├── Email.layer.ts               # (existing)
├── Persistence.layer.ts         # (existing)
└── index.ts                     # Barrel exports + composed layers
```

### Layer Interface Pattern
Each layer file must follow this structure:

```typescript
// v1/observability/Telemetry.layer.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
// ... other Effect imports

// 1. Service definitions (if creating new services)
export class TelemetryConfig extends Context.Tag("TelemetryConfig")<
  TelemetryConfig,
  { readonly serviceName: string; readonly environment: string }
>() {}

// 2. Services type (union of all provided services)
export type Services =
  | Tracer.Tracer
  | Metrics.Metrics
  | Resource.Resource;

// 3. Layer implementation
export const layer: Layer.Layer<Services, never, never> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const env = yield* serverEnv;
    // ... configuration logic
    return NodeSdk.layer(() => ({ /* config */ }));
  })
);

// 4. Optional: Development variant
export const layerDev: Layer.Layer<Services, never, never> = // ...
```

### Health Check Response Schema
```typescript
// HealthCheck should return structured JSON
interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string; // ISO 8601
  version: string;
  checks: {
    database: { status: "up" | "down"; latencyMs?: number };
    redis: { status: "up" | "down"; latencyMs?: number };
    s3: { status: "up" | "down" };
  };
  uptime: number; // seconds
}
```

### Graceful Shutdown Behavior
1. Stop accepting new connections (`HttpServer`)
2. Wait for in-flight requests (max 30s timeout)
3. Close database connections in order:
   - `DocumentsDb` (slice-specific)
   - `IamDb` (slice-specific)
   - `SharedDb` (shared infrastructure)
4. Flush telemetry buffers (`NodeSdk` tracer/metrics/logs)
5. Close Redis connections (if session store active)
6. Exit with code 0

**Services requiring shutdown hooks** (in `GracefulShutdown.layer.ts`):
- `BunHttpServer` - Stop accepting connections
- `SharedDb.SharedDb` - Close Postgres connection pool
- `IamDb.IamDb` - Close Postgres connection pool
- `DocumentsDb.DocumentsDb` - Close Postgres connection pool
- `NodeSdk` - Flush and shutdown OTLP exporters
- `RedisClient` (if used) - Close Redis connection

---

## Examples

### Telemetry Layer Configuration
```typescript
// v1/observability/Telemetry.layer.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { serverEnv } from "@beep/shared-infra/ServerEnv";

// Environment-aware OTLP setup
export const layer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { otlp, app } = yield* serverEnv;

    return NodeSdk.layer(() => ({
      resource: {
        serviceName: `${app.name}-server`,
        serviceVersion: app.version,
        deploymentEnvironment: app.env,
      },
      spanProcessor: new BatchSpanProcessor(
        new OTLPTraceExporter({ url: otlp.traceUrl })
      ),
      logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({ url: otlp.logUrl })
      ),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: otlp.metricUrl }),
        exportIntervalMillis: 60000,
      }),
    }));
  })
);
```

### Request Context Layer (Correlation IDs)
```typescript
// v1/observability/RequestContext.layer.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as O from "effect/Option";
import * as FiberRef from "effect/FiberRef";
import { HttpServerRequest } from "@effect/platform";
import { Uuid } from "effect";

// Request context service tag
export class RequestContext extends Context.Tag("RequestContext")<
  RequestContext,
  { readonly requestId: string; readonly traceId: O.Option<string> }
>() {}

// FiberRef for propagating request ID through the fiber tree
export const requestIdRef = FiberRef.unsafeMake<string>("unknown");

// Middleware that extracts or generates correlation ID
export const extractRequestContext = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const headerRequestId = O.fromNullable(request.headers["x-request-id"]);
  const requestId = O.getOrElse(headerRequestId, () => Uuid.make());
  const traceId = O.fromNullable(request.headers["x-trace-id"]);

  // Set on FiberRef for propagation
  yield* FiberRef.set(requestIdRef, requestId);

  // Annotate all logs with request context
  return yield* Effect.annotateLogs(
    Effect.succeed({ requestId, traceId }),
    { "request.id": requestId }
  );
});

export type Services = RequestContext;
export const layer: Layer.Layer<Services, never, never> = Layer.effect(
  RequestContext,
  extractRequestContext
);
```

### HTTP Middleware Composition
```typescript
// v1/http/HttpServer.layer.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as F from "effect/Function";
import { HttpMiddleware, HttpRouter, HttpServer } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { CorsConfig } from "./Cors.layer";
import { errorHandler } from "./ErrorHandler.layer";

// Compose middleware in execution order (first applied = outermost)
const withMiddleware = F.flow(
  HttpMiddleware.cors(CorsConfig),           // 1. CORS headers
  HttpMiddleware.logger,                     // 2. Request/response logging
  errorHandler,                              // 3. Error response mapping
);

// Server layer with middleware applied to router
export const make = (router: HttpRouter.HttpRouter<never, never>) =>
  Layer.unwrapEffect(
    Effect.gen(function* () {
      const app = router.pipe(withMiddleware);
      return BunHttpServer.layer({ port: 8080 }).pipe(
        Layer.provide(HttpServer.serve(app))
      );
    })
  );
```

### Health Check with Dependency Probes
```typescript
// v1/http/HealthCheck.layer.ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Duration from "effect/Duration";
import * as DateTime from "effect/DateTime";
import { HttpRouter, HttpServerResponse } from "@effect/platform";
import { SharedDb } from "@beep/shared-infra/db";

// Database connectivity probe
const probeDatabase = Effect.gen(function* () {
  const db = yield* SharedDb.SharedDb;
  const startTime = DateTime.unsafeNow();

  // db.execute returns Effect, not Promise - no tryPromise needed
  const result = yield* db.execute((client) =>
    client.execute("SELECT 1 as health")
  ).pipe(
    Effect.map(() => ({ status: "up" as const })),
    Effect.catchAll(() => Effect.succeed({ status: "down" as const }))
  );

  const endTime = DateTime.unsafeNow();
  // DateTime.distance returns Duration, convert to millis
  const latencyMs = F.pipe(
    DateTime.distance(startTime, endTime),
    Duration.toMillis
  );

  return { ...result, latencyMs };
});

// Health check route returning structured JSON
export const healthCheckRoute = HttpRouter.get(
  "/health",
  Effect.gen(function* () {
    const dbCheck = yield* probeDatabase;
    const timestamp = DateTime.unsafeNow();

    const status = dbCheck.status === "up" ? "healthy" : "degraded";

    return HttpServerResponse.json({
      status,
      timestamp: DateTime.formatIso(timestamp),
      version: "1.0.0", // TODO: Read from package.json
      checks: { database: dbCheck },
      uptime: process.uptime(), // Bun/Node compatible
    });
  })
);

export type Services = never; // Route only, no services provided
export const layer = Layer.succeed({} as never); // Placeholder
```

### Error Response Schema
```typescript
// v1/http/ErrorHandler.layer.ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { HttpServerResponse } from "@effect/platform";
import { requestIdRef } from "../observability/RequestContext.layer";
import * as DateTime from "effect/DateTime";
import * as FiberRef from "effect/FiberRef";

// Standardized error response schema
export const ErrorResponseSchema = S.Struct({
  error: S.Struct({
    code: S.String,
    message: S.String,
    details: S.optional(S.Unknown),
  }),
  timestamp: S.String,
  requestId: S.String,
});

export type ErrorResponse = S.Schema.Type<typeof ErrorResponseSchema>;

// Middleware that catches errors and formats responses
export const errorHandler = <R, E>(
  app: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>
) =>
  Effect.catchAll(app, (error) =>
    Effect.gen(function* () {
      const requestId = yield* FiberRef.get(requestIdRef);
      const timestamp = DateTime.formatIso(DateTime.unsafeNow());

      // Extract error code from tagged errors
      const code = (error as { _tag?: string })?._tag ?? "InternalError";
      const message = error instanceof Error ? error.message : "Unknown error";

      const body: ErrorResponse = {
        error: { code, message },
        timestamp,
        requestId,
      };

      // Log the error with context
      yield* Effect.logError("http.error", error);

      return HttpServerResponse.json(body, { status: 500 });
    })
  );
```

### Barrel Export Structure
```typescript
// v1/index.ts
import * as Layer from "effect/Layer";

// Re-export individual layers
export { layer as telemetryLayer, type Services as TelemetryServices } from "./observability/Telemetry.layer";
export { layer as loggingLayer, type Services as LoggingServices } from "./observability/Logging.layer";
export { layer as devToolsLayer } from "./observability/DevTools.layer";
export { layer as requestContextLayer, type Services as RequestContextServices } from "./observability/RequestContext.layer";

export { layer as corsLayer } from "./http/Cors.layer";
export { layer as errorHandlerLayer, ErrorResponseSchema } from "./http/ErrorHandler.layer";
export { healthCheckRoute } from "./http/HealthCheck.layer";
export { make as makeHttpServer } from "./http/HttpServer.layer";

export { layer as gracefulShutdownLayer } from "./resilience/GracefulShutdown.layer";

// Re-export existing domain layers
export { layer as authContextLayer, type Services as AuthContextServices } from "./AuthContext.layer";
export { layer as authenticationLayer, type Services as AuthenticationServices } from "./Authentication.layer";
export { layer as dataAccessLayer, type Services as DataAccessServices } from "./DataAccess.layer";
export { layer as emailLayer, type Services as EmailServices } from "./Email.layer";
export { layer as persistenceLayer, type Services as PersistenceServices } from "./Persistence.layer";

// Composed layers for convenience
export { layer as toolingLayer, type Services as ToolingServices } from "./Tooling.layer";

// Pre-composed application layers
export const ObservabilityLive = Layer.mergeAll(
  telemetryLayer,
  loggingLayer,
  devToolsLayer,
  requestContextLayer
);

export const HttpInfrastructureLive = Layer.mergeAll(
  corsLayer,
  errorHandlerLayer,
  gracefulShutdownLayer
);

export const DomainServicesLive = authContextLayer.pipe(
  Layer.provideMerge(authenticationLayer),
  Layer.provideMerge(dataAccessLayer),
  Layer.provideMerge(emailLayer),
  Layer.provideMerge(persistenceLayer)
);

// Full application layer (all services composed)
export const ApplicationLive = DomainServicesLive.pipe(
  Layer.provideMerge(ObservabilityLive),
  Layer.provideMerge(HttpInfrastructureLive)
);
```

---

## Verification Checklist

### Code Quality
- [ ] All Effect imports use namespace pattern (`import * as Effect`)
- [ ] No native array/string/object methods used
- [ ] No `switch`, `typeof`, `instanceof` patterns
- [ ] No `async/await` or bare Promises
- [ ] No `process.env` or `Bun.env` access
- [ ] All errors use `S.TaggedError` or `BeepError.*`
- [ ] Secrets use `Redacted<string>`

### Layer Structure
- [ ] Each layer exports `Services` type
- [ ] Each layer exports `layer` (lowercase)
- [ ] Dependencies explicitly declared in Layer type signature
- [ ] No circular dependencies between layers
- [ ] Composition uses `Layer.provide`/`Layer.provideMerge`/`Layer.mergeAll`

### Observability
- [ ] Telemetry layer exports traces, logs, and metrics
- [ ] Logging layer switches between pretty (dev) and JSON (prod)
- [ ] DevTools layer conditionally included based on `app.env !== "production"`
- [ ] All HTTP requests have correlation IDs via `RequestContext.layer`
- [ ] Spans created for all significant operations
- [ ] Request IDs propagate through logs via `Effect.annotateLogs`

### HTTP Infrastructure
- [ ] Health check returns structured JSON
- [ ] Health check probes database connectivity
- [ ] CORS configured from environment
- [ ] Error responses follow consistent schema
- [ ] Graceful shutdown implemented

### Testing
- [ ] `bun run check --filter @beep/server-runtime` passes
- [ ] `bun run lint --filter @beep/server-runtime` passes
- [ ] `bun run test --filter @beep/server-runtime` passes (if tests exist)

---

## Metadata

### Research Sources
**Files Explored**:
- `apps/server/src/server.ts`
- `packages/runtime/server/src/App.ts`
- `packages/runtime/server/src/Logging.ts`
- `packages/runtime/server/src/Tracing.ts`
- `packages/runtime/server/src/DevTools.ts`
- `packages/runtime/server/src/v1/*.layer.ts` (all 6 files)
- `packages/shared/infra/src/ServerEnv.ts`
- `packages/common/errors/src/server/`

**Documentation Referenced**:
- `@effect/opentelemetry` - NodeSdk, Otlp, Resource patterns
- `@effect/platform` - HttpServer, HttpMiddleware composition
- `effect` - Logger, Layer composition, ManagedRuntime

**AGENTS.md Files Consulted**:
- `packages/runtime/server/AGENTS.md`
- `packages/runtime/client/AGENTS.md`
- `packages/shared/infra/AGENTS.md`
- `packages/common/errors/AGENTS.md`
- `apps/server/AGENTS.md`

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 2 HIGH, 3 MEDIUM, 2 LOW | Fixed db probe API (Effect not Promise), added OTLP imports, fixed DateTime.distance→Duration.toMillis, clarified Tooling.layer.ts scope, moved RequestContext to observability/, added error response schema, added GracefulShutdown dependencies, added barrel export example, added DevTools verification check |
