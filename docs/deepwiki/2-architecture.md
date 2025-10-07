# Architecture | kriegcloud/beep-effect | DeepWiki

_Source: https://deepwiki.com/kriegcloud/beep-effect/2-architecture_

Relevant source files
*   [apps/web/next.config.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/next.config.ts)
*   [apps/web/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json)
*   [apps/web/tsconfig.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.json)
*   [apps/web/tsconfig.test.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.test.json)
*   [docker-compose.yml](https://github.com/kriegcloud/beep-effect/blob/b64126f6/docker-compose.yml)
*   [package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json)
*   [packages/common/constants/src/paths/asset-paths.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/constants/src/paths/asset-paths.ts)
*   [packages/common/constants/src/paths/generated/asset-paths.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/constants/src/paths/generated/asset-paths.ts)
*   [packages/iam/infra/src/adapters/better-auth/Auth.service.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts)
*   [packages/iam/sdk/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/sdk/package.json)
*   [packages/iam/sdk/src/clients/sign-in/sign-in.client.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/sdk/src/clients/sign-in/sign-in.client.ts)
*   [packages/iam/sdk/src/index.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/sdk/src/index.ts)
*   [packages/iam/ui/src/sign-up/sign-up.view.tsx](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/ui/src/sign-up/sign-up.view.tsx)
*   [packages/runtime/client/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/package.json)
*   [packages/runtime/client/src/services/runtime/live-layer.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts)
*   [packages/runtime/server/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/package.json)
*   [packages/runtime/server/src/server-runtime.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts)
*   [pnpm-lock.yaml](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml)
*   [tsconfig.base.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json)
*   [tsconfig.build.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.build.json)
*   [tsconfig.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.json)

This document describes the high-level architectural decisions, design patterns, and structural organization of the beep-effect repository. It covers the foundational principles that govern how the codebase is organized and how its components interact.

For specific implementation details, refer to:

*   Workspace and package organization: [Monorepo Structure](https://deepwiki.com/kriegcloud/beep-effect/2.1-monorepo-structure)
*   Functional programming patterns and dependency injection: [Effect Ecosystem Integration](https://deepwiki.com/kriegcloud/beep-effect/2.2-effect-ecosystem-integration)
*   Bounded context structure and layering: [Domain-Driven Design](https://deepwiki.com/kriegcloud/beep-effect/2.3-domain-driven-design)

* * *

Architectural Philosophy
------------------------

The beep-effect repository implements a functional-first, domain-driven architecture built on the Effect-TS ecosystem. The codebase prioritizes type safety, composability, and explicit dependency management through Effect's Layer system. All asynchronous operations, error handling, and side effects are encoded in the Effect type system, making the code's behavior explicit and testable.

**Core Design Principles:**

| Principle | Implementation |
| --- | --- |
| **Functional Core, Imperative Shell** | Pure business logic in domain layers, side effects isolated in infrastructure layers |
| **Explicit Dependencies** | Services composed via Effect Layers, dependencies declared in service constructors |
| **Type-Driven Development** | Effect Schema for runtime validation, branded types for domain identifiers |
| **Vertical Slice Architecture** | Each bounded context owns its full stack from database to UI |
| **Observability First** | OpenTelemetry integration at runtime level, structured logging throughout |

Sources: [Diagram 1](https://github.com/kriegcloud/beep-effect/blob/b64126f6/Diagram%201)[Diagram 4](https://github.com/kriegcloud/beep-effect/blob/b64126f6/Diagram%204)[packages/runtime/server/src/server-runtime.ts 1-123](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L1-L123)[packages/runtime/client/src/services/runtime/live-layer.ts 1-146](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L1-L146)

* * *

Technology Stack
----------------

**Key Technology Decisions:**

*   **Effect-TS**: Provides the foundational type system for encoding effects, errors, and dependencies. All async operations flow through `Effect<Success, Error, Requirements>`.
*   **pnpm + Turbo**: Monorepo toolchain enables efficient workspace management with shared dependencies and parallel task execution.
*   **Drizzle ORM**: Type-safe SQL query builder that integrates with Effect SQL for composable database operations.
*   **Better-auth**: Authentication library integrated via adapters in the IAM infrastructure layer.
*   **OpenTelemetry**: Instrumentation injected at the runtime layer for distributed tracing and metrics.

Sources: [pnpm-lock.yaml 1-100](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml#L1-L100)[package.json 1-312](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L1-L312)[tsconfig.base.json 1-344](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L1-L344)

* * *

Repository Structure
--------------------

The repository follows a pnpm workspace monorepo structure with clear separation between applications, domain packages, core infrastructure, and common utilities:

**Workspace Categories:**

| Category | Path | Purpose |
| --- | --- | --- |
| **Applications** | `apps/*` | Deployable applications consuming domain packages |
| **Domain Contexts** | `packages/iam/*`, `packages/files/*` | Bounded contexts with vertical slices |
| **Shared Domain** | `packages/shared/*` | Cross-cutting domain concepts |
| **Core Infrastructure** | `packages/core/*` | Database, email, environment configuration |
| **Common Utilities** | `packages/common/*` | Reusable utilities, schemas, rules engine |
| **UI Library** | `packages/ui` | Shared React components |
| **Runtime** | `packages/runtime/*` | Client and server runtime configuration |
| **Tooling** | `tooling/*` | Code generation, build utilities |

Sources: [package.json 9-13](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L9-L13)[tsconfig.json 12-118](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.json#L12-L118)[tsconfig.base.json 49-341](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L49-L341)

* * *

Runtime Architecture
--------------------

The codebase employs separate runtime configurations for client and server environments, each providing environment-specific services through Effect's Layer system:

**Runtime Layer Composition:**

The runtime layers are assembled using Effect's `Layer.mergeAll` and `Layer.provide` combinators:

```
// Client Runtime
createClientRuntimeLayer: ClientRuntimeLive = (queryClient) =>
  Layer.mergeAll(
    HttpClientLive,
    ObservabilityLive,
    NetworkMonitorLive,
    WorkerClientLive,
    makeQueryClientLayer(queryClient)
  ).pipe(Layer.provide(LogLevelLive));

// Server Runtime
serverRuntime = ManagedRuntime.make(
  AppLive.pipe(Layer.provide([ObservabilityLive, LogLevelLive]))
);
```

Each runtime exposes helper functions for executing Effects within the configured environment:

*   **Client**: `runClientPromise`, `runClientPromiseExit`, `makeRunClientPromise`
*   **Server**: `runServerPromise`, `runServerPromiseExit`

All executions are automatically wrapped in observability spans for tracing.

Sources: [packages/runtime/client/src/services/runtime/live-layer.ts 1-146](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L1-L146)[packages/runtime/server/src/server-runtime.ts 1-123](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L1-L123)

* * *

Observability & Telemetry
-------------------------

Observability is integrated at the runtime layer using OpenTelemetry with Effect's `@effect/opentelemetry` package. Both client and server runtimes export traces and logs to a centralized OTLP collector:

**Telemetry Configuration:**

| Component | Client | Server |
| --- | --- | --- |
| **SDK** | `WebSdk` (browser) | `NodeSdk` (Node.js) |
| **Trace Exporter** | `OTLPTraceExporter` | `OTLPTraceExporter` |
| **Log Exporter** | `OTLPLogExporter` | `OTLPLogExporter` |
| **Span Processor** | `BatchSpanProcessor` | `BatchSpanProcessor` |
| **Log Processor** | `BatchLogRecordProcessor` | `BatchLogRecordProcessor` |
| **Service Name** | `${appName}-client` | `${appName}-server` |

The OTLP collector endpoints are configured via environment variables:

*   Client: `NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL`, `NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL`
*   Server: `OTLP_TRACE_EXPORTER_URL`, `OTLP_LOG_EXPORTER_URL`

The Grafana LGTM stack (Loki, Grafana, Tempo, Mimir) consumes telemetry data for visualization and alerting.

Sources: [packages/runtime/client/src/services/runtime/live-layer.ts 36-57](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L36-L57)[packages/runtime/server/src/server-runtime.ts 23-63](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L23-L63)[docker-compose.yml 23-32](https://github.com/kriegcloud/beep-effect/blob/b64126f6/docker-compose.yml#L23-L32)

* * *

Authentication is handled by the `better-auth` library integrated via the `AuthService` in the IAM infrastructure layer. Authorization uses a policy-based system built on Effect's context propagation:

**Authentication Providers:**

The `AuthService` is configured with:

*   Email/password authentication
*   Social OAuth providers (Google, GitHub, etc.)
*   Passkey/WebAuthn support
*   Email verification flows
*   Password reset flows

Database hooks in `AuthService` automatically create personal organizations and member records when users sign up.

Sources: [packages/iam/infra/src/adapters/better-auth/Auth.service.ts 1-250](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts#L1-L250)[Diagram 2](https://github.com/kriegcloud/beep-effect/blob/b64126f6/Diagram%202)

* * *

Database Architecture
---------------------

The database layer uses a factory pattern (`Db.make`) to create standardized database services from domain schemas. Each domain context has its own database service composed into the runtime:

**Database Service Composition:**

The server runtime composes database services hierarchically:

```
// Individual domain databases
SliceDatabasesLive = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live)

// Database infrastructure with PgClient
DatabaseInfrastructureLive = Layer.provideMerge(SliceDatabasesLive, Db.Live)

// Repository services backed by databases
RepositoriesLive = Layer.provideMerge(SliceRepositoriesLive, DatabaseInfrastructureLive)
```

Each database service exposes:

*   `db`: Effect SQL client for queries
*   `drizzle`: Drizzle ORM client for type-safe queries
*   `transaction`: Transactional context wrapper
*   `execute`: Query execution helper

Sources: [packages/runtime/server/src/server-runtime.ts 66-79](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L66-L79)[Diagram 3](https://github.com/kriegcloud/beep-effect/blob/b64126f6/Diagram%203)

* * *

Build System & Code Generation
------------------------------

The monorepo uses Turbo for parallel task execution and pnpm for workspace management. The build pipeline compiles TypeScript to both ESM and CommonJS formats:

**Build Scripts:**

| Script | Purpose |
| --- | --- |
| `pnpm build` | Compile all packages via Turbo |
| `pnpm dev` | Start development servers with watch mode |
| `pnpm check` | Run type checking across all packages |
| `pnpm lint` | Lint code with Biome and check circular dependencies |
| `pnpm test` | Run Vitest test suites |
| `pnpm db:generate` | Generate TypeScript types from database schemas |

**Code Generators:**

*   `drizzle-kit generate`: Generates TypeScript types from Drizzle schemas
*   `effect codegen`: Generates index files and exports for Effect packages
*   `generate-env-secrets.ts`: Creates environment variable templates
*   `generate-asset-paths.ts`: Generates type-safe asset path constants

Sources: [package.json 21-52](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L21-L52)[Diagram 7](https://github.com/kriegcloud/beep-effect/blob/b64126f6/Diagram%207)

* * *

Security Architecture
---------------------

Security is enforced at multiple layers:

**Content Security Policy (CSP):**

The Next.js application configures CSP headers in middleware with nonce generation for inline scripts. The CSP directives restrict script sources, connect sources, and frame ancestors:

```
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "blob:", "https://cdn.jsdelivr.net"],
  "connect-src": CONNECT_SRC, // Includes OTLP origins
  // ... additional directives
};
```

**Security Headers:**

The following headers are applied to all responses:

*   `Cross-Origin-Opener-Policy: same-origin`
*   `X-Frame-Options: SAMEORIGIN`
*   `X-Content-Type-Options: nosniff`
*   `Referrer-Policy: same-origin`
*   `X-XSS-Protection: 1; mode=block`

**Authentication Security:**

*   Session cookies with `httpOnly`, `secure`, and `sameSite` flags
*   Password hashing via better-auth's bcrypt implementation
*   Rate limiting on authentication endpoints (100 requests per 10 seconds)
*   Email verification for new accounts
*   OAuth token encryption enabled

Sources: [apps/web/next.config.ts 38-122](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/next.config.ts#L38-L122)

* * *

Type System & Validation
------------------------

The codebase leverages Effect Schema for runtime validation and type derivation. All external data (API requests, environment variables, database results) flows through schema validation:

**Schema Usage Patterns:**

```
// Define schema
const UserSchema = S.Struct({
  id: SharedEntityIds.UserId,
  email: S.String,
  name: S.String,
});

// Derive types
type User = S.Schema.Type<typeof UserSchema>;
type UserEncoded = S.Schema.Encoded<typeof UserSchema>;

// Validate at runtime
const decodeUser = S.decode(UserSchema);
const encodeUser = S.encode(UserSchema);
```

**Branded Types:**

Domain identifiers use branded types created by the `EntityId.make` factory:

```
export const UserId = EntityId.make<"user_id">()({
  tableName: "user",
  prefix: "user",
});
```

This ensures type safety at compile time (preventing mixing of different ID types) and provides runtime validation.

Sources: [tsconfig.base.json 1-344](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L1-L344)[Diagram 5](https://github.com/kriegcloud/beep-effect/blob/b64126f6/Diagram%205)

* * *

Deployment & Infrastructure
---------------------------

The repository includes Docker Compose configuration for local development services:

**Service Stack:**

| Service | Container | Port | Purpose |
| --- | --- | --- | --- |
| PostgreSQL | `beep-db` | 5432 | Primary database |
| Redis | `beep-redis` | 6379 | Session storage |
| Grafana LGTM | `grafana` | 4000, 4318 | Observability stack |

The Grafana LGTM container provides:

*   **Loki**: Log aggregation
*   **Grafana**: Visualization dashboard
*   **Tempo**: Distributed tracing
*   **Mimir**: Metrics storage

Environment variables are managed via `dotenvx` for encrypted secrets and multi-environment configuration.

Sources: [docker-compose.yml 1-37](https://github.com/kriegcloud/beep-effect/blob/b64126f6/docker-compose.yml#L1-L37)[package.json 45](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L45-L45)

* * *

Development Workflow
--------------------

**Local Development Setup:**

1.   Install dependencies: `pnpm install`
2.   Start infrastructure: `pnpm services:up`
3.   Generate database types: `pnpm db:generate`
4.   Run migrations: `pnpm db:migrate`
5.   Start dev servers: `pnpm dev`

**Package Development:**

Each package follows a consistent structure:

```
packages/[domain]/[layer]/
├── src/           # Source code
├── test/          # Test files
├── build/         # Compiled output (ESM + CJS)
├── package.json   # Package manifest
└── tsconfig.*.json # TypeScript configs
```

Packages are built with TypeScript project references for incremental compilation and proper dependency ordering.

**Testing:**

*   Unit tests: Vitest with Effect test utilities (`@effect/vitest`)
*   Integration tests: PgContainer for database tests
*   Coverage: Vitest coverage via V8

Sources: [package.json 21-52](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L21-L52)[tsconfig.base.json 1-10](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L1-L10)
