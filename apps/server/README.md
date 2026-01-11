# @beep/server

Production entry point for the Effect-based backend runtime on Bun.

## Purpose

`@beep/server` is the production entry point for launching the Effect-based backend runtime on Bun. It delegates all functionality to `@beep/runtime-server`, which provides the complete HTTP API, authentication, observability, and slice integration (IAM, documents). The server architecture uses `@effect/platform` with declarative Layer composition for dependency injection.

This application is a thin wrapper that:
- Launches the server runtime with `Layer.launch(Server.layer)`
- Runs on Bun via `@effect/platform-bun/BunRuntime`
- Inherits all routes, middleware, and infrastructure from `@beep/runtime-server`

## Installation

This package is an internal monorepo application and is not published to npm.

To run the server in development:

```bash
# From monorepo root
bun run dev --filter=@beep/server

# Or from apps/server directory
bun run dev
```

## Key Exports

This package is an **application entry point** and does not export modules. The complete server implementation is in `src/server.ts`:

```typescript
import { Server } from "@beep/runtime-server";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Layer from "effect/Layer";

// Launch the server
Layer.launch(Server.layer).pipe(BunRuntime.runMain);
```

All routing, middleware, authentication, and infrastructure layers are provided by `@beep/runtime-server`.

## Server Architecture

### Implementation Overview

The server delegates all functionality to `@beep/runtime-server`, which composes layers for:

1. **HTTP Routing** (`HttpRouter.layer`) - IAM API, RPC, health checks, OpenAPI docs
2. **Authentication** (`AuthContext.layer`) - Better Auth integration and session management
3. **Middleware** - CORS, logging, request tracing, span naming
4. **Persistence** (`Persistence.layer`) - Database clients, repositories, storage
5. **Tooling** (`Tooling.layer`) - Email service, tracing exporters
6. **Platform** - Bun HTTP server, fetch client, logger configuration

The `Server.layer` from `@beep/runtime-server` provides the complete composition:

```typescript
// From @beep/runtime-server/Server.layer.ts
export const layer = HttpRouter.layer.pipe(
  Layer.provide(BunHttpServer.layer({ port: serverEnv.app.api.port })),
  Layer.provide([
    FetchHttpClient.layer,
    HttpServer.layerContext,
    EffectLogger.minimumLogLevel(serverEnv.app.logLevel),
    Persistence.layer,
    Tooling.layer,
  ])
);
```

### Available Endpoints

Routes are defined in `@beep/runtime-server/HttpRouter.layer.ts`:

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `GET /v1/health` | Health check returning "OK" | No |
| `GET /v1/docs` | Scalar API documentation UI | No |
| `GET /v1/docs/openapi.json` | OpenAPI 3.x specification | No |
| `POST /v1/iam/*` | IAM domain API endpoints | Yes (via `AuthContext.layer`) |
| `POST /v1/documents/rpc` | Documents RPC endpoint | Yes |

### Authentication Flow

Authentication is handled by `AuthContext.layer` from `@beep/runtime-server`, which:
1. Extracts session information from request headers/cookies
2. Validates sessions against Better Auth
3. Provides authenticated context to protected routes
4. Integrates with `@beep/iam-server` for user/tenant resolution

Protected routes (IAM API, RPC) are wrapped with `AuthContext.layer`, while public routes (health, docs) bypass authentication.

## Layer Composition

The runtime server composes layers in this dependency order:

```
Server.layer
├── HttpRouter.layer (serves all routes with middleware)
│   ├── ProtectedRoutes (requires AuthContext.layer)
│   │   ├── IamApiRoutes (HttpLayerRouter.addHttpApi)
│   │   └── Rpc.layer (Documents RPC)
│   ├── PublicRoutes
│   │   ├── DocsRoute (Scalar UI)
│   │   └── HealthRoute
│   └── CorsMiddleware (applied to all routes)
├── BunHttpServer.layer (port from serverEnv.app.api.port)
└── Infrastructure Layers
    ├── FetchHttpClient.layer
    ├── HttpServer.layerContext
    ├── Logger (minimum level from serverEnv.app.logLevel)
    ├── Persistence.layer (DB clients, repos, storage)
    └── Tooling.layer (email, tracing)
```

### Configuration

All configuration is read from `@beep/shared-env/ServerEnv`:
- `serverEnv.app.api.port` - HTTP server port (used in BunHttpServer.layer)
- `serverEnv.app.apiHost` - API host for URL construction
- `serverEnv.app.apiPort` - API port for URL construction
- `serverEnv.app.logLevel` - Minimum log level (Debug, Info, Warning, Error)
- `serverEnv.security.trustedOrigins` - CORS allowed origins

The server never reads `process.env` or `Bun.env` directly; all environment access goes through Effect Config layers provided by `@beep/shared-env`.

### Middleware Stack

Middleware is applied in `HttpRouter.layer`:

1. **CORS** - `HttpLayerRouter.cors` with trusted origins from `serverEnv.security.trustedOrigins`, allowed methods (GET, POST, PUT, DELETE, PATCH) via `BS.HttpMethod.pickOptions`, allowed headers from `@beep/constants/AllowedHeaders`, and credentials enabled
2. **Logger** - HTTP request/response logging via `Logger.httpLogger` from `@beep/runtime-server`
3. **Tracer** - Span generation with `HttpMiddleware.withSpanNameGenerator`, disabled for OPTIONS requests and `/v1/health` and `/v1/documents/rpc` endpoints using `HttpMiddleware.withTracerDisabledWhen`
4. **Auth Context** - `AuthContext.layer` provides authentication to protected routes (IAM API, RPC)

### Slice Integration

Vertical slices are integrated through their respective layers:

| Slice | Domain API | Implementation | Integration Point |
|-------|-----------|----------------|-------------------|
| **IAM** | `@beep/iam-domain/IamApi` | `@beep/iam-server/IamApiLive` | `IamApiRoutes` in `HttpRouter.layer` |
| **Documents** | `@beep/documents-domain` | `@beep/documents-server` | `Rpc.layer` in `HttpRouter.layer` |

Route handlers receive their dependencies (repos, DB clients, storage) through Layer composition in `Persistence.layer`.

## Dependencies

This application depends primarily on `@beep/runtime-server`, which transitively provides all infrastructure:

| Category | Direct Dependencies |
|----------|---------------------|
| **Core Runtime** | `@beep/runtime-server`, `@effect/platform-bun`, `effect` |
| **Configuration** | `@beep/shared-env` |

All other dependencies (database, auth, slices, observability) are managed by `@beep/runtime-server`. See the runtime-server package for the complete dependency tree.

## Development Commands

Run from the monorepo root using workspace filters:

| Command | Description |
|---------|-------------|
| `bun run dev --filter=@beep/server` | Start development server with hot reload (loads `.env` from repo root) |
| `bun run build --filter=@beep/server` | Compile TypeScript to `build/esm` and `build/dts` |
| `bun run check --filter=@beep/server` | Type-check with TypeScript |
| `bun run lint --filter=@beep/server` | Lint with Biome |
| `bun run lint:fix --filter=@beep/server` | Auto-fix lint issues |
| `bun run test --filter=@beep/server` | Run test suite |

Local package scripts (run from `apps/server/`):

| Command | Description |
|---------|-------------|
| `bun run dev` | Start with dotenvx loading `.env` from repo root |
| `bun run build` | Compile to `build/` directory |
| `bun run start` | Run compiled server |
| `bun run lint:circular` | Check for circular dependencies with madge |
| `bun run coverage` | Run tests with coverage report |

## Adding New Features

This application is a thin wrapper over `@beep/runtime-server`. To add new functionality:

### Adding New Endpoints

**Do not modify `apps/server` directly.** Instead:

1. **Define API contracts** in the appropriate domain package (`@beep/xxx-domain`)
2. **Implement handlers** in the slice's server package (`@beep/xxx-server`)
3. **Register routes** in `@beep/runtime-server/HttpRouter.layer.ts`

Example for adding a new slice API:

```typescript
// In @beep/runtime-server/HttpRouter.layer.ts
import { NewSliceApi } from "@beep/new-slice-domain";
import { NewSliceApiLive } from "@beep/new-slice-server";

const NewSliceApiRoutes = HttpLayerRouter.addHttpApi(NewSliceApi, {
  openapiPath: "/v1/docs/openapi.json",
}).pipe(Layer.provideMerge(NewSliceApiLive));

// Add to protected or public routes as needed
const ProtectedRoutes = Layer.mergeAll(
  IamApiRoutes,
  NewSliceApiRoutes,  // Add here
  Rpc.layer
).pipe(Layer.provide(AuthContext.layer));
```

### Adding Simple Routes

For standalone endpoints without full HttpApi contracts, add to `HttpRouter.layer.ts`:

```typescript
const CustomRoute = HttpLayerRouter.use((router) =>
  router.add("GET", "/v1/custom",
    Effect.gen(function* () {
      yield* Effect.logInfo("Custom endpoint called");
      return HttpServerResponse.json({ message: "Custom response" });
    })
  )
);

// Merge into PublicRoutes or ProtectedRoutes
const PublicRoutes = Layer.mergeAll(DocsRoute, HealthRoute, CustomRoute);
```

### Configuration Changes

Configuration is read from `@beep/shared-env/ServerEnv`. To add new config:

1. Update the ServerEnv schema in `@beep/shared-env`
2. Reference via `serverEnv.yourNewConfig` in runtime layers
3. Never read `process.env` or `Bun.env` directly

### Guidelines

- Use tagged errors from `@beep/errors` and `@beep/invariant`
- Keep logs JSON-safe; avoid logging secrets or sensitive data
- Let `HttpLayerRouter` and `HttpApiBuilder` handle error responses automatically
- Follow Effect-first patterns (no `async/await`, use `Effect.gen`)

## Integration Points

### Runtime Server

All functionality is provided by `@beep/runtime-server`:
- **HttpRouter.layer** - Route definitions, middleware, CORS
- **AuthContext.layer** - Better Auth integration and session management
- **Persistence.layer** - Database clients, repositories, S3 storage
- **Tooling.layer** - Email service, tracing exporters

### Slice APIs

Vertical slices integrate through HttpApi contracts:
- **IAM**: `@beep/iam-domain/IamApi` implemented by `@beep/iam-server/IamApiLive`
- **Documents**: RPC endpoints via `@beep/documents-server/Rpc.layer`

### Observability

Tracing and logging are configured in `@beep/runtime-server`:
- OpenTelemetry traces exported to configured OTLP endpoint
- Structured JSON logs with configurable minimum level
- HTTP request/response logging via middleware
- Span names follow pattern: `http {METHOD} {path}`

## Architecture Principles

### Effect-First Development

- **No `async/await`**: Use `Effect.gen`, `Effect.fn`, `Effect.tryPromise` with tagged errors
- **Layer-based DI**: All dependencies injected through Layers (no singletons or mutable module state)
- **Tagged Errors**: Use `Schema.TaggedError` from `effect/Schema` for all error types
- **Effect Collections**: Use `effect/Array`, `effect/String`, etc. instead of native methods

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";

// Single-letter aliases
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
```

### Required Effect Utilities

```typescript
// Array operations - NEVER use native methods
F.pipe(items, A.map((item) => item.name));        // not items.map()
F.pipe(items, A.filter((item) => item.active));   // not items.filter()

// String operations - NEVER use native methods
F.pipe(str, Str.toUpperCase);                      // not str.toUpperCase()
F.pipe(str, Str.split(" "));                       // not str.split()

// Option operations
F.pipe(headers, Headers.get("host"), O.getOrElse(F.constant("localhost")));

// DateTime - NEVER use native Date
DateTime.unsafeNow();                              // not new Date()
DateTime.add(date, { days: 1 });                   // not date.setDate()

// Match - NEVER use switch or long if-else chains
Match.value(x).pipe(
  Match.tag("success", (s) => handleSuccess(s)),
  Match.tag("error", (e) => handleError(e)),
  Match.exhaustive
);
```

See `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md` for complete Effect patterns and critical rules.

## See Also

- `apps/server/AGENTS.md` — Server-specific patterns and guidelines
- `packages/runtime/server/` — Complete runtime implementation (routing, auth, persistence)
- `packages/runtime/server/AGENTS.md` — Runtime layer patterns and extension points
- `packages/iam/server/AGENTS.md` — IAM server implementation
- `packages/documents/server/AGENTS.md` — Documents server implementation
- `CLAUDE.md` — Monorepo-wide conventions and Effect patterns
- `AGENTS.md` — Repository overview and package structure
