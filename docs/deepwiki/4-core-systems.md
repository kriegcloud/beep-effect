# Core Systems | kriegcloud/beep-effect | DeepWiki

_Source: https://deepwiki.com/kriegcloud/beep-effect/4-core-systems_

Relevant source files
*   [.github/workflows/check.yml](https://github.com/kriegcloud/beep-effect/blob/b64126f6/.github/workflows/check.yml)
*   [docker-compose.yml](https://github.com/kriegcloud/beep-effect/blob/b64126f6/docker-compose.yml)
*   [packages/_internal/db-admin/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/package.json)
*   [packages/_internal/db-admin/src/execute.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/src/execute.ts)
*   [packages/common/constants/src/paths/asset-paths.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/constants/src/paths/asset-paths.ts)
*   [packages/common/constants/src/paths/generated/asset-paths.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/constants/src/paths/generated/asset-paths.ts)
*   [packages/common/errors/src/shared.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/errors/src/shared.ts)
*   [packages/core/db/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/package.json)
*   [packages/core/db/src/db.factory.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/db.factory.ts)
*   [packages/core/db/src/errors.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/errors.ts)
*   [packages/core/db/src/postgres/common.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/postgres/common.ts)
*   [packages/core/db/src/postgres/postgres-error.enum.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/postgres/postgres-error.enum.ts)
*   [packages/iam/infra/src/adapters/better-auth/Auth.service.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts)
*   [packages/iam/sdk/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/sdk/package.json)
*   [packages/iam/sdk/src/clients/sign-in/sign-in.client.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/sdk/src/clients/sign-in/sign-in.client.ts)
*   [packages/iam/sdk/src/index.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/sdk/src/index.ts)
*   [packages/iam/ui/src/sign-up/sign-up.view.tsx](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/ui/src/sign-up/sign-up.view.tsx)
*   [packages/runtime/client/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/package.json)
*   [packages/runtime/client/src/services/runtime/live-layer.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts)
*   [packages/runtime/server/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/package.json)
*   [packages/runtime/server/src/server-runtime.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts)

Purpose and Scope
-----------------

The core systems provide foundational infrastructure that is shared across all applications and domains in the beep-effect repository. These systems establish the runtime environment, database connectivity, authentication mechanisms, and observability capabilities required by higher-level domain services.

This document covers the architecture and relationships between core systems. For detailed information about specific subsystems:

*   Database layer implementation details, see [Database Layer](https://deepwiki.com/kriegcloud/beep-effect/4.1-database-layer)
*   Client and server runtime configuration, see [Runtime and Service Composition](https://deepwiki.com/kriegcloud/beep-effect/4.2-runtime-and-service-composition)
*   Authentication flows and authorization policies, see [Authentication and Authorization](https://deepwiki.com/kriegcloud/beep-effect/4.3-authentication-and-authorization)
*   Telemetry and logging infrastructure, see [Observability](https://deepwiki.com/kriegcloud/beep-effect/4.4-observability)

Core Systems Architecture
-------------------------

The core systems are organized into four primary subsystems that work together to provide application infrastructure:

**Core Systems Composition Flow**

Sources: [packages/runtime/server/src/server-runtime.ts 1-123](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L1-L123)[packages/runtime/client/src/services/runtime/live-layer.ts 1-146](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L1-L146)[packages/core/db/src/db.factory.ts 1-187](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/db.factory.ts#L1-L187)

### System Component Table

| Core System | Primary Package | Key Exports | Purpose |
| --- | --- | --- | --- |
| Database Layer | `@beep/core-db` | `Db.make`, `Db.Live`, `DbError` | Type-safe database factory with transaction support |
| Server Runtime | `@beep/runtime-server` | `serverRuntime`, `runServerPromise` | Managed runtime with all server dependencies |
| Client Runtime | `@beep/runtime-client` | `createClientRuntimeLayer`, `runClientPromise` | Browser runtime with HTTP and telemetry |
| Auth Service | `@beep/iam-infra` | `AuthService`, `Policy` | better-auth integration and authorization |
| Observability | Multiple | `TelemetryLive`, `LoggerLive` | OpenTelemetry trace and log exporters |

Sources: [packages/core/db/package.json 1-68](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/package.json#L1-L68)[packages/runtime/server/package.json 1-119](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/package.json#L1-L119)[packages/runtime/client/package.json 1-101](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/package.json#L1-L101)

Effect Layer Composition
------------------------

The core systems use Effect's `Layer` abstraction for dependency injection. Services are composed hierarchically, with each layer providing dependencies to the layers above it.

**Effect Layer Dependency Hierarchy**

Sources: [packages/runtime/server/src/server-runtime.ts 62-102](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L62-L102)[packages/runtime/client/src/services/runtime/live-layer.ts 79-96](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L79-L96)

### Layer Construction Pattern

The codebase follows a consistent pattern for constructing Effect layers:

1.   **Foundation layers** provide external infrastructure (database connections, HTTP clients)
2.   **Infrastructure layers** compose foundation layers into domain-specific database services
3.   **Service layers** use infrastructure to implement business logic
4.   **Application layers** compose all services into a managed runtime

```
// Example from server runtime
const SliceDatabasesLive = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live);
const DatabaseInfrastructureLive = Layer.provideMerge(SliceDatabasesLive, Db.Live);
const RepositoriesLive = Layer.provideMerge(SliceRepositoriesLive, DatabaseInfrastructureLive);
const CoreServicesLive = Layer.provideMerge(RepositoriesLive, AuthEmailLive);
```

Sources: [packages/runtime/server/src/server-runtime.ts 66-89](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L66-L89)

Database Infrastructure Overview
--------------------------------

The database layer provides a factory pattern (`Db.make`) that creates type-safe database services from Drizzle schemas. Each domain context gets its own database service with consistent APIs for queries and transactions.

**Database Service Factory and Error Handling**

Each database service provides:

*   **execute**: Wraps Drizzle queries with error handling
*   **transaction**: Provides transactional execution with Effect context
*   **makeQuery**: Creates queries that automatically use active transaction or execute directly

Sources: [packages/core/db/src/db.factory.ts 81-186](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/db.factory.ts#L81-L186)[packages/core/db/src/errors.ts 1-213](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/errors.ts#L1-L213)

The database layer implements sophisticated error extraction to unwrap PostgreSQL errors from nested Effect/Drizzle error structures:

| Error Type | Detection Method | Extraction Strategy |
| --- | --- | --- |
| `postgres.PostgresError` | `S.is(DbErrorCause)` | Direct instance check |
| `SqlError` with nested cause | Check `_tag === "SqlError"` | Traverse `.cause` property |
| `DrizzleQueryError` | Instance check | JSON round-trip to extract nested error |
| `FiberFailure` with cause | Check `_id === "FiberFailure"` | Recursive cause traversal |
| Nested `Cause<unknown>` | `Cause.isCause()` | Use `extractPostgresErrorFromCause` |

The extraction uses breadth-first search through error chains to find the underlying PostgreSQL error, handling various serialization and wrapping patterns from the Effect and Drizzle libraries.

Sources: [packages/core/db/src/errors.ts 32-122](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/errors.ts#L32-L122)[packages/_internal/db-admin/src/execute.ts 48-96](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/src/execute.ts#L48-L96)

Runtime Service Composition
---------------------------

The runtime layers differ between client and server environments while maintaining similar structure:

### Server Runtime Composition

**Server Runtime Service Graph**

Sources: [packages/runtime/server/src/server-runtime.ts 23-102](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L23-L102)

### Client Runtime Composition

**Client Runtime Service Graph**

Sources: [packages/runtime/client/src/services/runtime/live-layer.ts 23-96](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L23-L96)

### Runtime Helper Functions

Both runtimes export helper functions for running Effects with tracing:

| Function | Runtime | Return Type | Purpose |
| --- | --- | --- | --- |
| `runServerPromise` | Server | `Promise<A>` | Execute Effect with server runtime, add span |
| `runServerPromiseExit` | Server | `Promise<Exit<A, E>>` | Execute and capture full Exit value |
| `runClientPromise` | Client | `Promise<A>` | Execute Effect with client runtime, add span |
| `runClientPromiseExit` | Client | `Promise<Exit<A, E>>` | Execute and capture full Exit value |
| `makeRunClientPromise` | Client | `(effect) => Promise<A>` | Create bound runner function |

All runtime helpers automatically wrap Effects with `Effect.withSpan` for distributed tracing.

Sources: [packages/runtime/server/src/server-runtime.ts 99-123](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L99-L123)[packages/runtime/client/src/services/runtime/live-layer.ts 104-146](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/client/src/services/runtime/live-layer.ts#L104-L146)

Authentication Service Architecture
-----------------------------------

The authentication layer integrates better-auth with Effect services, providing session management and authorization policies.

**AuthService Configuration and Policy System**

Sources: [packages/iam/infra/src/adapters/better-auth/Auth.service.ts 27-249](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts#L27-L249)

### Database Hooks Integration

The AuthService configures better-auth with database hooks that maintain consistency between authentication state and domain entities:

**User Creation Hook** ([packages/iam/infra/src/adapters/better-auth/Auth.service.ts 121-159](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts#L121-L159)):

1.   Generates `personalOrgId` using `SharedEntityIds.OrganizationId.create()`
2.   Generates `personalMemberId` using `IamEntityIds.MemberId.create()`
3.   Creates organization with `type: "individual"` and `isPersonal: true`
4.   Adds user as owner with `role: "owner"` and `status: "active"`

**Session Creation Hook** ([packages/iam/infra/src/adapters/better-auth/Auth.service.ts 162-217](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts#L162-L217)):

1.   Queries all active organizations for the user
2.   Sets `activeOrganizationId` to first organization (personal org first)
3.   Builds `organizationContext` JSON with role, type, and subscription info
4.   Stores context in session for authorization checks

Sources: [packages/iam/infra/src/adapters/better-auth/Auth.service.ts 119-219](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/better-auth/Auth.service.ts#L119-L219)

Error Handling and Logging
--------------------------

The core systems provide unified error handling and pretty logging across client and server environments.

**Error Extraction and Logging Pipeline**

Sources: [packages/core/db/src/errors.ts 1-213](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/errors.ts#L1-L213)[packages/common/errors/src/shared.ts 1-242](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/errors/src/shared.ts#L1-L242)

### PostgreSQL Error Classification

The error system maps PostgreSQL SQLSTATE codes to typed error variants:

| Error Class | SQLSTATE Pattern | Example Codes | Usage |
| --- | --- | --- | --- |
| Integrity Constraint | `23xxx` | `23505` (UNIQUE_VIOLATION), `23503` (FOREIGN_KEY_VIOLATION) | Constraint validation |
| Data Exception | `22xxx` | `22001` (STRING_DATA_RIGHT_TRUNCATION), `22P02` (INVALID_TEXT_REPRESENTATION) | Data validation |
| Syntax Error | `42xxx` | `42601` (SYNTAX_ERROR), `42P01` (UNDEFINED_TABLE) | Query validation |
| Transaction Rollback | `40xxx` | `40001` (SERIALIZATION_FAILURE), `40P01` (DEADLOCK_DETECTED) | Concurrency control |
| Connection Exception | `08xxx` | `08006` (CONNECTION_FAILURE), `08001` (UNABLE_TO_ESTABLISH) | Connection handling |

The `PostgresErrorEnum` contains over 500 error code mappings for precise error handling.

Sources: [packages/core/db/src/postgres/postgres-error.enum.ts 1-800](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/postgres/postgres-error.enum.ts#L1-L800)

### Pretty Logger Configuration

The shared logging infrastructure supports both client and server with configurable output:

```
interface PrettyLoggerConfig {
  readonly level: LogLevel.LogLevel;           // Minimum log level
  readonly colors: boolean;                     // ANSI color codes
  readonly showDate: boolean;                   // Timestamp prefix
  readonly showFiberId: boolean;                // Effect Fiber ID
  readonly showSpans: boolean;                  // Trace spans
  readonly showAnnotations: boolean;            // Log annotations
  readonly includeCausePretty: boolean;         // Pretty-print cause
}
```

The logger uses color-coding based on log level:

*   Fatal/Error: Red
*   Warning: Yellow
*   Info: Green
*   Debug: Cyan
*   Trace: Gray

Sources: [packages/common/errors/src/shared.ts 22-67](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/errors/src/shared.ts#L22-L67)

Service Initialization Flow
---------------------------

The initialization sequence ensures dependencies are available before dependent services start:

**Service Initialization Sequence**

The initialization follows Effect's Layer dependency resolution. If any layer fails to initialize (e.g., database connection error), the entire runtime fails with a descriptive error, preventing the application from starting in an invalid state.

Sources: [packages/runtime/server/src/server-runtime.ts 23-102](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L23-L102)[packages/core/db/src/db.factory.ts 44-66](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/db.factory.ts#L44-L66)

Configuration and Environment
-----------------------------

Core systems read configuration from environment variables via the `@beep/core-env` package:

| Configuration Area | Environment Variables | Used By |
| --- | --- | --- |
| Database | `DB_PG_URL`, `DB_PG_SSL`, `DB_PG_PORT` | `Db.Live`, `PgClient.layer` |
| OTLP Telemetry | `OTLP_TRACE_EXPORTER_URL`, `OTLP_LOG_EXPORTER_URL` | `TelemetryLive` |
| Authentication | `AUTH_SECRET`, `AUTH_URL`, `OAUTH_*` | `AuthService` |
| Logging | `LOG_LEVEL`, `LOG_COLORS` | `LoggerLive`, `LogLevelLive` |
| Redis | `REDIS_PORT` | better-auth session storage |

Configuration is validated at startup using Effect's `Config` API with `Config.redacted` for sensitive values.

Sources: [packages/core/db/src/db.factory.ts 44-51](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/db.factory.ts#L44-L51)[packages/runtime/server/src/server-runtime.ts 23-31](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/runtime/server/src/server-runtime.ts#L23-L31)[docker-compose.yml 1-37](https://github.com/kriegcloud/beep-effect/blob/b64126f6/docker-compose.yml#L1-L37)

Testing Infrastructure
----------------------

The database layer provides test utilities for containerized testing:

**Database Test Container Lifecycle**

The test infrastructure uses Testcontainers to spin up isolated PostgreSQL instances for each test suite, ensuring tests don't interfere with development databases.

Sources: [packages/_internal/db-admin/package.json 23-24](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/package.json#L23-L24)
