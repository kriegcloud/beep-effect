# @beep/server

Effect-first backend runtime host for the beep-effect monorepo.

## Purpose

This package serves as the entry point for running backend workloads on Bun. The server provides an HTTP API built with `@effect/platform`, serving IAM domain APIs, Better Auth authentication endpoints, OpenAPI documentation, and health checks. All functionality is composed through Effect Layers for dependency injection, observability, and slice integration (IAM, documents).

## Key Exports

| Export | Description |
|--------|-------------|
| `AllRoutes` | Combined HTTP route layer (IAM API + health endpoint) |
| `ServerLayer` | Complete server configuration with CORS, auth middleware, and platform bindings |
| `DomainApiLayer` | IAM domain API implementation layer |
| `HttpApiRouter` | IAM API router with context |

The server launches via `Layer.launch(ServerLayer).pipe(BunRuntime.runMain)` and listens on port 8080.

## Server Architecture

### Current Implementation

The server uses `@effect/platform` HTTP API builder pattern with declarative Layer composition:

```typescript
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Layer } from "effect";
import { IamRoutes } from "@beep/iam-infra";
import { IamDomainApi } from "@beep/iam-domain";

// Domain API layer with route implementations
const DomainApiLayer = HttpApiBuilder.api(IamDomainApi).pipe(
  Layer.provide(IamRoutes.layer)
);

// HTTP router for IAM endpoints
const HttpApiRouter = HttpLayerRouter.addHttpApi(IamDomainApi).pipe(
  Layer.provide(IamRoutes.layer),
  Layer.provide(HttpServer.layerContext)
);

// Health check endpoint
const HealthRoute = HttpLayerRouter.use((router) =>
  router.add("GET", "/api/health", HttpServerResponse.text("OK"))
);

// Combined routes
export const AllRoutes = Layer.mergeAll(HttpApiRouter, HealthRoute);

// Complete server with middleware and platform bindings
const ServerLayer = ApiConsumersLayer.pipe(
  Layer.provide(DomainApiLayer),
  Layer.provide(HttpApiBuilder.middlewareCors({ /* ... */ })),
  HttpServer.withLogAddress,
  Layer.provide(AuthContextHttpMiddlewareLive),
  Layer.provide(BunHttpServer.layer({ port: 8080 })),
  Layer.provide(HttpServer.layerContext),
  Layer.provide(FetchHttpClient.layer)
);

// Launch
Layer.launch(ServerLayer).pipe(BunRuntime.runMain);
```

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check returning "OK" |
| `POST /v1/iam/sign-in/email` | Email sign-in endpoint (IAM domain API) |
| `POST /v1/iam/sign-up/email` | Email sign-up endpoint (IAM domain API) |
| `* /api/auth/*` | Better Auth handler (all auth flows) |
| `GET /v1/docs` | Scalar API documentation UI |
| `GET /v1/docs/openapi.json` | OpenAPI specification |

### Better Auth Integration

The server integrates Better Auth through a custom handler at `/api/auth/*`:

```typescript
// From src/auth/BetterAuthHandler/BetterAuthHandler.ts
export const make: (req: HttpServerRequest) =>
  Effect.Effect<HttpServerResponse, never, AuthService> =
  Effect.fn("BetterAuthHandler.make")(function* (req) {
    const { auth } = yield* AuthService;

    // Convert Effect request to Web API Request
    const request = new Request(url, {
      method: req.method,
      headers: webHeaders,
      body: bodyInit
    });

    // Call Better Auth handler
    const webResponse = yield* Effect.promise(
      F.constant(auth.handler(request))
    );

    // Convert back to Effect response
    return HttpServerResponse.raw(webResponse.body, {
      status: webResponse.status,
      headers: responseHeaders
    });
  });
```

## Layer Composition

### Middleware Stack

The server applies middleware in this order:

1. **CORS** - Configured via `HttpApiBuilder.middlewareCors` with trusted origins from `serverEnv.security.trustedOrigins`
2. **Logger** - Request/response logging via `HttpMiddleware.logger`
3. **Auth Context** - `AuthContextHttpMiddlewareLive` extracts and validates authentication
4. **OpenAPI** - Auto-generated docs served at `/v1/docs/openapi.json`

### Configuration

Environment configuration is read through `@beep/shared-infra`:
- `serverEnv.security.trustedOrigins` - CORS allowed origins
- Port configuration (currently hardcoded to 8080)

The server references `serverEnv` directly rather than reading `process.env` or `Bun.env`.

### Slice Integration

IAM functionality is integrated via:
- `@beep/iam-domain` - Domain API contracts (`IamDomainApi`)
- `@beep/iam-infra` - Route implementations (`IamRoutes.layer`)

Route handlers are provided to the API builder through Layer composition, ensuring dependency injection for repositories, database clients, and other services.

### CORS Configuration

The server configures CORS with:
- Allowed origins from `serverEnv.security.trustedOrigins`
- Methods: GET, POST, PUT, DELETE, PATCH
- Headers from `@beep/constants/AllowedHeaders`
- Credentials enabled for cookie-based auth

## Dependencies

| Category | Packages |
|----------|----------|
| **Runtime** | `@beep/runtime-server` |
| **IAM Slice** | `@beep/iam-domain`, `@beep/iam-infra`, `@beep/iam-tables` |
| **Documents Slice** | `@beep/documents-domain`, `@beep/documents-infra`, `@beep/documents-tables` |
| **Common** | `@beep/constants`, `@beep/contract`, `@beep/errors`, `@beep/identity`, `@beep/invariant`, `@beep/schema`, `@beep/utils` |
| **Shared** | `@beep/shared-domain`, `@beep/shared-infra`, `@beep/shared-tables` |
| **Effect Platform** | `effect`, `@effect/platform`, `@effect/platform-bun`, `@effect/rpc` |
| **Effect SQL** | `@effect/sql`, `@effect/sql-pg`, `@effect/sql-drizzle` |
| **Observability** | `@effect/opentelemetry`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-logs`, `@opentelemetry/sdk-metrics` |
| **Auth** | `better-auth`, `@better-auth/core`, `@better-auth/stripe`, `@dub/better-auth`, `@simplewebauthn/server`, `jose` |
| **External Services** | `stripe`, `resend`, `dub` |
| **Database** | `drizzle-orm`, `postgres` |
| **Orchestration** | `@effect/cluster`, `@effect/workflow`, `@effect/experimental` |
| **Utilities** | `@faker-js/faker`, `uuid`, `zod` |

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

## Adding New Endpoints

### Using HttpApiBuilder

When adding new domain APIs, follow the established pattern:

1. **Define the API contract** in the domain package (`@beep/xxx-domain`)
2. **Implement route handlers** in the infra package (`@beep/xxx-infra`)
3. **Register the API** in `src/server.ts`:

```typescript
import { NewDomainApi } from "@beep/new-domain";
import { NewRoutes } from "@beep/new-infra";

// Create API layer
const NewApiLayer = HttpApiBuilder.api(NewDomainApi).pipe(
  Layer.provide(NewRoutes.layer)
);

// Add to router
const NewApiRouter = HttpLayerRouter.addHttpApi(NewDomainApi).pipe(
  Layer.provide(NewRoutes.layer),
  Layer.provide(HttpServer.layerContext)
);

// Merge with existing routes
export const AllRoutes = Layer.mergeAll(
  HttpApiRouter,
  NewApiRouter,
  HealthRoute
);
```

### Using HttpLayerRouter for Simple Routes

For standalone endpoints without full API contracts:

```typescript
const CustomRoute = HttpLayerRouter.use((router) =>
  router.add("GET", "/api/custom",
    Effect.gen(function* () {
      yield* Effect.logInfo("Custom endpoint called");
      return HttpServerResponse.json({ message: "Custom response" });
    })
  )
);
```

### Configuration

- Read configuration from `serverEnv` (`@beep/shared-infra`)
- Never read `process.env` or `Bun.env` directly
- Keep port and TLS settings configurable

### Error Handling

- Use tagged errors from `@beep/errors` and `@beep/invariant`
- Keep logs JSON-safe in production
- Avoid logging secrets or sensitive data
- Let `HttpApiBuilder` handle error responses automatically

## Integration Points

### Better Auth

The server integrates Better Auth for authentication:
- Handler mounted at `/api/auth/*` via `BetterAuthHandler`
- Auth context extracted via `AuthContextHttpMiddlewareLive` middleware
- Session management through `AuthService` from `@beep/runtime-server`

### IAM Domain API

IAM endpoints follow the HttpApi pattern:
- Contract defined in `@beep/iam-domain` (`IamDomainApi`)
- Implementations in `@beep/iam-infra` (`IamRoutes.layer`)
- Endpoints:
  - `POST /v1/iam/sign-in/email` - Email sign-in
  - `POST /v1/iam/sign-up/email` - Email sign-up

### OpenAPI Documentation

Auto-generated documentation available via:
- `GET /v1/docs` - Scalar UI for interactive API exploration
- `GET /v1/docs/openapi.json` - OpenAPI 3.x specification

### Health Check

Simple health endpoint for monitoring:
- `GET /api/health` - Returns "OK" text response

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
// Array operations
F.pipe(items, A.map((item) => item.name));        // not items.map()
F.pipe(items, A.filter((item) => item.active));   // not items.filter()

// String operations
F.pipe(str, Str.toUpperCase);                      // not str.toUpperCase()
F.pipe(str, Str.split(" "));                       // not str.split()

// Option operations
F.pipe(headers, Headers.get("host"), O.getOrElse(F.constant("localhost")));
```

## See Also

- `/home/elpresidank/YeeBois/projects/beep-effect/apps/server/AGENTS.md` — Server-specific patterns and guidelines
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/server/AGENTS.md` — Runtime layer patterns
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/infra/AGENTS.md` — IAM infrastructure implementation
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md` — Monorepo-wide conventions
