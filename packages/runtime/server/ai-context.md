---
path: packages/runtime/server
summary: Production Effect runtime composing observability, persistence, auth, and HTTP layers
tags: [runtime, layers, effect, observability, managed-runtime]
---

# @beep/runtime-server

Production-grade Effect runtime providing ManagedRuntime for server-side Effect execution. Composes authentication, persistence, observability, and HTTP layers into a unified foundation for Next.js API routes and standalone Bun servers.

## Architecture

```
|------------------|     |---------------------|
|  serverRuntime   | --> |  runServerPromise   |
|  (ManagedRuntime)|     |  runServerPromiseExit|
|------------------|     |---------------------|
        |
        v
|---------------------|
| serverRuntimeLayer  |
|---------------------|
        |
        +--> Authentication.layer
        |         |
        |         +--> Auth.layer (@beep/iam-server)
        |         +--> Email.layer
        |         +--> DataAccess.layer --> SliceRepos
        |
        +--> Persistence.layer
        |         |
        |         +--> DbClient.layer (PostgreSQL)
        |         +--> S3Service.defaultLayer
        |
        +--> Tooling.layer
        |         |
        |         +--> Tracer.layer (OTLP)
        |         +--> DevTools
        |
        +--> FetchHttpClient.layer

|------------------|
|   Server.layer   | --> Standalone HTTP server
|------------------|
        |
        +--> HttpRouter.layer
        |         |
        |         +--> ProtectedRoutes (AuthContext)
        |         +--> PublicRoutes (BetterAuth, health)
        |
        +--> BunHttpServer.layer
        +--> Persistence.layer
        +--> Tooling.layer
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Runtime.ts` | ManagedRuntime instance and `runServerPromise` helpers |
| `Authentication.layer.ts` | Combines Auth, Email, and DataAccess services |
| `DataAccess.layer.ts` | All slice repositories with persistence infrastructure |
| `Persistence.layer.ts` | PostgreSQL client and S3 storage layers |
| `HttpRouter.layer.ts` | HTTP routing with CORS, middleware, AuthContext |
| `Server.layer.ts` | Complete HTTP server composition for standalone use |
| `Tracer.layer.ts` | OpenTelemetry tracing configuration |
| `Tooling.layer.ts` | DevTools and tracer composition |
| `AuthContext.layer.ts` | Request-scoped authentication context |
| `Email.layer.ts` | Email service provider layer |
| `BetterAuthRouter.layer.ts` | BetterAuth HTTP route handlers |
| `Rpc.layer.ts` | RPC layer composition |
| `Logger.layer.ts` | Structured logging configuration |

## Usage Patterns

### Execute Effect in Server Context

```typescript
import * as Effect from "effect/Effect";
import { runServerPromise } from "@beep/runtime-server";
import { IamRepos } from "@beep/iam-server";

const program = Effect.gen(function* () {
  const userRepo = yield* IamRepos.UserRepo;
  return yield* userRepo.findAll();
});

export async function GET() {
  const users = await runServerPromise(program, "api.users.list");
  return Response.json(users);
}
```

### Extend Runtime with Custom Services

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { Authentication } from "@beep/runtime-server";

class JobQueue extends Effect.Tag("JobQueue")<
  JobQueue,
  { readonly enqueue: (job: string) => Effect.Effect<void> }
>() {}

const JobQueueLive = Layer.succeed(JobQueue, {
  enqueue: (job) => Effect.logInfo("job.enqueued", { job }),
});

export const jobRuntime = ManagedRuntime.make(
  Layer.mergeAll(JobQueueLive, Authentication.layer)
);
```

### Standalone HTTP Server

```typescript
import * as Layer from "effect/Layer";
import { Server } from "@beep/runtime-server";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";

BunRuntime.runMain(Layer.launch(Server.layer));
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single ManagedRuntime | Prevents connection pool leaks; resources shared across requests |
| Lazy initialization | First `runPromise` call triggers layer setup (DB, OTLP) |
| Span-wrapped execution | `runServerPromise` auto-wraps in tracing span for observability |
| Layer composition order | Left-to-right in `Layer.mergeAll`; rightmost wins for conflicts |
| AuthContext in HttpRouter | Request context must be available before route handlers execute |

## Dependencies

**Internal**: `@beep/shared-server`, `@beep/shared-env`, `@beep/iam-server`, `@beep/documents-server`, `@beep/customization-server`, `@beep/comms-server`, `@beep/calendar-server`, `@beep/knowledge-server`

**External**: `effect`, `@effect/platform`, `@effect/platform-bun`, `@effect/opentelemetry`, `@effect/sql-pg`, `better-auth`

## Related

- **AGENTS.md** - Detailed contributor guidance with gotchas and environment config
