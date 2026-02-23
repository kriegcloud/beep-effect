# @beep/runtime-server

Effect-based production server runtime providing observability, persistence, and application services.

## Overview

`@beep/runtime-server` provides the production-grade Effect runtime that powers server-side entry points in the beep-effect monorepo. This package:

- Bundles observability infrastructure (tracing, logging, dev tools)
- Wires persistence layers (database clients, S3 storage, repositories)
- Composes authentication and authorization services
- Provides HTTP routing with CORS and middleware
- Exports a `ManagedRuntime` for executing server Effects

The runtime acts as the shared foundation for server-side hosts (Next.js API routes, standalone Bun servers) by encapsulating layer composition so applications don't hand-wire infrastructure dependencies.

## Key Exports

| Export | Description |
|--------|-------------|
| `serverRuntime` | `ManagedRuntime` instance with full application layer composition (`packages/runtime/server/src/Runtime.ts:5`) |
| `runServerPromise` | Executes an Effect within the runtime with automatic span wrapping (`packages/runtime/server/src/Runtime.ts:12`) |
| `runServerPromiseExit` | Like `runServerPromise` but returns full `Exit` value (`packages/runtime/server/src/Runtime.ts:21`) |
| `Server.layer` | Root server layer combining HTTP server, routing, persistence, and tooling (`packages/runtime/server/src/Server.layer.ts:22`) |
| `Authentication.layer` | Authentication services layer combining Auth, Email, and DataAccess (`packages/runtime/server/src/Authentication.layer.ts:7`) |
| `Persistence.layer` | Database clients and S3 storage infrastructure (`packages/runtime/server/src/Persistence.layer.ts:57`) |
| `DataAccess.layer` | Slice repositories with persistence infrastructure (`packages/runtime/server/src/DataAccess.layer.ts:59`) |
| `HttpRouter.layer` | HTTP routing with CORS, middleware, and authentication (`packages/runtime/server/src/HttpRouter.layer.ts:39`) |
| `Tracer.layer` | OTLP tracing and observability configuration (`packages/runtime/server/src/Tracer.layer.ts:16`) |
| `Tooling.layer` | Dev tools and tracing composition (`packages/runtime/server/src/Tooling.layer.ts:17`) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-server` | Database client infrastructure, shared services, environment config |
| `@beep/shared-env` | Typed environment variable access (serverEnv) |
| `@beep/iam-server` | IAM authentication, authorization, and user management |
| `@beep/documents-server` | Document repositories and services |
| `@beep/customization-server` | Customization slice repositories |
| `@beep/comms-server` | Communications slice repositories |
| `@effect/platform` | HTTP server abstractions |
| `@effect/platform-bun` | Bun-specific HTTP server runtime |
| `@effect/opentelemetry` | OpenTelemetry integration |
| `effect` | Core Effect runtime |

## Architecture

The runtime composes layers in this dependency hierarchy:

```
serverRuntime (ManagedRuntime)
  └─ Authentication.layer
       ├─ Auth.layer (from @beep/iam-server)
       ├─ Email.layer
       └─ DataAccess.layer
            ├─ SliceRepos (IAM, Documents, Shared, Customization, Comms)
            └─ Persistence.layer
                 ├─ DbClient.layer (PostgreSQL connection pool)
                 └─ S3Service.defaultLayer

Server.layer (for HTTP servers)
  └─ HttpRouter.layer
       ├─ ProtectedRoutes (requires AuthContext)
       └─ PublicRoutes (BetterAuth, health checks)
  └─ BunHttpServer.layer
  └─ Persistence.layer
  └─ Tooling.layer (DevTools + Tracer)
```

## Usage Patterns

### Executing Server Effects

```typescript
import * as Effect from "effect/Effect";
import { runServerPromise } from "@beep/runtime-server";
import { IamRepos } from "@beep/iam-server";

// In Next.js server component or API route
const program = Effect.gen(function* () {
  const userRepo = yield* IamRepos.UserRepo;
  const users = yield* userRepo.findAll();
  return users;
});

// Execute with automatic tracing span
export async function GET() {
  const users = await runServerPromise(program, "api.users.list");
  return Response.json(users);
}
```

### Accessing Services in Effects

```typescript
import * as Effect from "effect/Effect";
import { runServerPromise } from "@beep/runtime-server";
import { Auth } from "@beep/iam-server";

const program = Effect.gen(function* () {
  const authService = yield* Auth.Service;
  const session = yield* authService.api.getSession({
    headers: request.headers,
  });
  return session;
});

const session = await runServerPromise(program, "auth.getSession");
```

### Custom Runtime with Additional Services

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { Authentication } from "@beep/runtime-server";

// Define custom service
class JobQueue extends Effect.Tag("JobQueue")<
  JobQueue,
  { readonly enqueue: (job: string) => Effect.Effect<void> }
>() {}

const JobQueueLive = Layer.succeed(JobQueue, {
  enqueue: (job: string) => Effect.logInfo("job.enqueued", { job }),
});

// Compose with runtime layers
export const jobRuntime = ManagedRuntime.make(
  Layer.mergeAll(JobQueueLive, Authentication.layer)
);

// Use custom runtime
export const enqueueJob = (job: string) =>
  jobRuntime.runPromise(
    Effect.gen(function* () {
      const queue = yield* JobQueue;
      yield* queue.enqueue(job);
    }).pipe(Effect.withSpan("jobs.enqueue"))
  );
```

### Standalone HTTP Server

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Server } from "@beep/runtime-server";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";

// Run the full server
const program = Layer.launch(Server.layer);

BunRuntime.runMain(program);
```

## Integration Points

- **Used by**: Next.js app server components (e.g. `apps/<next-app>/src/app/layout.tsx`) via `runServerPromise`
- **Used by**: HTTP server entry points (standalone Bun servers)
- **Provides**: `serverRuntime` for executing server-side Effects with full infrastructure
- **Composes**: All slice-level services (IAM, Documents, Customization, Comms)
- **Depends on**: `@beep/shared-server` for database infrastructure and environment config

## Environment Configuration

The runtime relies on environment variables configured via `@beep/shared-env`:

| Variable | Purpose |
|----------|---------|
| `APP_NAME` | Service name for tracing (defaults to "beep") |
| `LOG_LEVEL` | Minimum log level (trace, debug, info, warn, error, fatal) |
| `APP_ENV` | Environment (development, production) - controls dev tools |
| `OTLP_TRACE_EXPORTER_URL` | OpenTelemetry trace export endpoint |
| `OTLP_LOG_EXPORTER_URL` | OpenTelemetry log export endpoint |
| `OTLP_METRIC_EXPORTER_URL` | OpenTelemetry metric export endpoint |
| `API_PORT` | HTTP server port (default: 3000) |
| `TRUSTED_ORIGINS` | CORS allowed origins (comma-separated) |

Reference `serverEnv` from `@beep/shared-env/ServerEnv` for typed access.

## Verifications

- `bun run check --filter=@beep/runtime-server` — Type safety validation
- `bun run lint --filter=@beep/runtime-server` — Biome formatting and linting
- `bun run test --filter=@beep/runtime-server` — Test suite execution

## Gotchas

### Layer Composition Order

Layers compose left-to-right in `Layer.mergeAll`. If two layers provide the same service, the rightmost wins. When extending `Authentication.layer` or `Server.layer`, verify which layer should take precedence for overlapping services.

### ManagedRuntime Lifecycle

`ManagedRuntime.make` allocates resources lazily on first effect execution. Layer initialization side effects (database connections, OTLP exporters) occur on the first `runPromise` call, not at construction time.

NEVER create multiple `ManagedRuntime` instances with overlapping resource layers (e.g., database pools). This leaks connections. Use a single `serverRuntime` and extend via layer composition.

In hot-reload scenarios (Next.js dev), the old runtime may not fully dispose before the new one starts. Watch for "connection refused" or "too many clients" errors.

### Tracing Span Propagation

`runServerPromise(effect, spanName)` wraps the effect in a span. Nested `Effect.withSpan` calls create child spans only if the outer span context is properly propagated.

NEVER use `Effect.runPromise` directly inside `runServerPromise`. This breaks the span hierarchy.

OTLP exporters batch spans asynchronously. In short-lived processes (serverless functions), spans may be lost if the process exits before the batch flushes.

### Environment Variable Timing

`serverEnv` is parsed at module load time via Effect Config. If environment variables are set after module initialization (e.g., via dotenv loaded late), the runtime will have stale or missing values.

ALWAYS ensure `.env` is loaded before any `@beep/runtime-server` imports.

### Effect.catchTag Requirements

`Effect.catchTag` narrows the error channel only if the tag is correctly defined via `Data.TaggedError`. Ad-hoc error objects without a `_tag` property will not match and will propagate unhandled.

### Stream Consumption

Effect streams (`Stream<A, E, R>`) must be consumed (via `Stream.runCollect`, `Stream.runForEach`) or they produce no output. When streaming database results, ensure the stream is consumed within the same transaction scope if consistency is required.

## Google Workspace Integration

The `GoogleWorkspace.layer` composes all Google Workspace adapters (Calendar, Gmail, Gmail Extraction) into a unified layer.

### Architecture Constraint (CRITICAL)

The `GoogleWorkspace.layer` requires `AuthContext` at layer construction time because `GoogleAuthClientLive` captures the user's OAuth context during initialization. This means:

- **CANNOT** be composed at router-level (before requests exist)
- **MUST** be provided within handlers where `AuthContext` is available in the request context
- Each request provides the layer with its own `AuthContext`

### Provided Services

| Service | Package | Purpose |
|---------|---------|---------|
| `GoogleCalendarAdapter` | `@beep/calendar-server` | Calendar event CRUD operations |
| `GmailAdapter` | `@beep/comms-server` | Email send/receive operations |
| `GmailExtractionAdapter` | `@beep/knowledge-server` | Read-only email extraction for knowledge graph |

### Usage Pattern

```typescript
import * as GoogleWorkspace from "@beep/runtime-server/GoogleWorkspace.layer";
import { GoogleCalendarAdapter } from "@beep/calendar-server/adapters";
import { GmailAdapter } from "@beep/comms-server/adapters";
import * as Effect from "effect/Effect";

// In a handler with AuthContext available in the request context:
const syncCalendarAndSendEmail = Effect.gen(function* () {
  const calendar = yield* GoogleCalendarAdapter;
  const gmail = yield* GmailAdapter;

  // Both adapters share the same OAuth context from AuthContext
  const events = yield* calendar.listEvents("primary", timeMin, timeMax);
  yield* gmail.sendMessage(to, "Calendar Update", "Your events...");

  return { eventCount: events.length };
}).pipe(
  Effect.provide(GoogleWorkspace.layer)  // Provides all Google Workspace services
);
```

### Scope Management

Each adapter declares its own required OAuth scopes following the principle of least privilege:

| Adapter | Required Scopes |
|---------|-----------------|
| `GoogleCalendarAdapter` | `calendar.events` (read/write events) |
| `GmailAdapter` | `gmail.readonly`, `gmail.send` (read + send emails) |
| `GmailExtractionAdapter` | `gmail.readonly` (read-only for extraction) |

When an operation requires scopes the user hasn't granted, the adapter emits `GoogleScopeExpansionRequiredError`, triggering incremental OAuth consent.

### Error Handling

All adapters emit these tagged errors:

```typescript
import { GoogleScopeExpansionRequiredError } from "@beep/google-workspace-domain";

const program = syncCalendarAndSendEmail.pipe(
  Effect.catchTag("GoogleScopeExpansionRequiredError", (error) =>
    // Redirect user to OAuth consent screen with expanded scopes
    Effect.gen(function* () {
      yield* Effect.logWarning("Scope expansion required", {
        requiredScopes: error.requiredScopes,
      });
      return redirectToOAuthConsent(error.requiredScopes);
    })
  ),
  Effect.catchTag("GoogleApiError", (error) =>
    // Handle API-level failures (network, rate limits, etc.)
    Effect.logError("Google API error", { error })
  )
);
```

### Layer Dependencies

```
GoogleWorkspace.layer
├─ GoogleCalendarAdapterLive
│  ├─ GoogleAuthClientLive (requires AuthContext)
│  └─ FetchHttpClient.layer
├─ GmailAdapterLive
│  ├─ GoogleAuthClientLive (requires AuthContext)
│  └─ FetchHttpClient.layer
└─ GmailExtractionAdapterLive
   ├─ GoogleAuthClientLive (requires AuthContext)
   └─ FetchHttpClient.layer
```

The `GoogleAuthClientLive` captures `AuthContext` at layer construction, binding OAuth tokens to the current user's session.

### Integration with Runtime

The `GoogleWorkspace.layer` is NOT part of the base `serverRuntime` because:

1. It requires per-request `AuthContext` (not available at runtime initialization)
2. Not all requests need Google Workspace access
3. Provides per-request OAuth isolation

Instead, handlers opt-in by providing the layer where `AuthContext` is available:

```typescript
// In RPC handler or HTTP route:
export const listCalendarEventsHandler = Effect.gen(function* () {
  // AuthContext is available here (injected by router middleware)
  const calendar = yield* GoogleCalendarAdapter;
  return yield* calendar.listEvents("primary", timeMin, timeMax);
}).pipe(
  Effect.provide(GoogleWorkspace.layer)  // Composes with request AuthContext
);
```

## Contributor Checklist

- [ ] Align new environment variables with `@beep/shared-env` exports
- [ ] Expose new layers via `index.ts` and document in Key Exports
- [ ] Add usage examples for new runtime entry points or helpers
- [ ] Re-run verification scripts (check, lint, test) before committing
- [ ] Update line number references if modifying layer structure
- [ ] Google Workspace integrations provide layer within handlers (not at router level)
- [ ] Handle `GoogleScopeExpansionRequiredError` with incremental OAuth consent
