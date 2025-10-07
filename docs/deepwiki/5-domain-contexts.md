# Domain Contexts | kriegcloud/beep-effect | DeepWiki

_Source: https://deepwiki.com/kriegcloud/beep-effect/5-domain-contexts_

Relevant source files
*   [apps/web/src/app/api/auth/[...all]/route.ts](https://deepwiki.com/kriegcloud/beep-effect/apps/web/src/app/api/auth/%5B...all%5D/route.ts)
*   [apps/web/src/libs/next/index.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/src/libs/next/index.ts)
*   [packages/_internal/db-admin/drizzle/0000_melted_killer_shrike.sql](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/0000_melted_killer_shrike.sql)
*   [packages/_internal/db-admin/drizzle/meta/0000_snapshot.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/meta/0000_snapshot.json)
*   [packages/_internal/db-admin/drizzle/meta/_journal.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/meta/_journal.json)
*   [packages/_internal/db-admin/src/Db.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/src/Db.ts)
*   [packages/_internal/db-admin/test/pg-container.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/test/pg-container.ts)
*   [packages/_internal/db-admin/tsconfig.test.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/tsconfig.test.json)
*   [packages/common/constants/src/Csp.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/common/constants/src/Csp.ts)
*   [packages/core/db/src/index.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/index.ts)
*   [packages/core/db/src/types.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/types.ts)
*   [packages/core/env/src/client.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/client.ts)
*   [packages/core/env/src/server.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts)
*   [packages/files/infra/src/adapters/repos/_common.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/adapters/repos/_common.ts)
*   [packages/files/infra/src/db/Db.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/db/Db.ts)
*   [packages/iam/infra/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/package.json)
*   [packages/iam/infra/src/adapters/repos/_common.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/repos/_common.ts)
*   [packages/iam/infra/src/db/Db.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/db/Db.ts)
*   [packages/iam/ui/src/sign-up/sign-up-email.form.tsx](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/ui/src/sign-up/sign-up-email.form.tsx)

This document explains the bounded context pattern used to organize business domains in the beep-effect repository. It covers how domains are structured using vertical slice architecture, how they maintain independence through layered dependencies, and how they compose together at runtime. For detailed information about specific domains, see [IAM Context](https://deepwiki.com/kriegcloud/beep-effect/5.1-iam-context), [Files Context](https://deepwiki.com/kriegcloud/beep-effect/5.2-files-context), and [Shared Domain](https://deepwiki.com/kriegcloud/beep-effect/5.3-shared-domain).

Purpose and Scope
-----------------

Domain contexts represent distinct bounded contexts following Domain-Driven Design principles. Each context encapsulates a specific business capability (Identity and Access Management, File Storage, etc.) and implements a vertical slice architecture with five distinct layers. This page focuses on the structural organization and composition patterns; implementation details of each domain are covered in their respective subsections.

Bounded Contexts Overview
-------------------------

The codebase implements three primary domain contexts, each organized as a self-contained package within the monorepo:

| Context | Package Location | Primary Responsibility | Database Schema |
| --- | --- | --- | --- |
| **IAM** | `packages/iam/*` | User authentication, organizations, teams, memberships, sessions | `@beep/iam-tables` |
| **Files** | `packages/files/*` | File storage, uploads, S3 integration | `@beep/shared-tables` (file table) |
| **Shared** | `packages/shared/*` | Common entities, value objects, cross-cutting concerns | `@beep/shared-tables` |

Each bounded context maintains strict boundaries and communicates through well-defined interfaces, preventing tight coupling between domains.

**Sources:**[packages/iam/infra/package.json 1-174](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/package.json#L1-L174)[packages/files/infra/src/db/Db.ts 1-16](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/db/Db.ts#L1-L16)[packages/_internal/db-admin/test/pg-container.ts 1-266](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/test/pg-container.ts#L1-L266)

Vertical Slice Architecture
---------------------------

### Layer Structure

Each domain context (IAM and Files) implements a five-layer vertical slice architecture:

**Dependency Flow:**

*   Dependencies flow unidirectionally from UI → SDK → Infra → Tables → Domain
*   Lower layers (Domain, Tables) have no knowledge of upper layers
*   Each layer depends only on the layer directly below it
*   All layers may depend on common packages (`@beep/schema`, `@beep/core-db`, etc.)

**Sources:**[packages/iam/infra/package.json 77-94](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/package.json#L77-L94)[packages/files/infra/src/adapters/repos/_common.ts 1-3](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/adapters/repos/_common.ts#L1-L3)

### Layer Responsibilities

**Sources:**[packages/iam/infra/src/db/Db.ts 1-22](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/db/Db.ts#L1-L22)[packages/files/infra/src/db/Db.ts 1-16](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/db/Db.ts#L1-L16)

Database Services per Context
-----------------------------

### Db.make Factory Pattern

Each domain context instantiates its own database service using the `Db.make` factory from `@beep/core-db`. This provides type-safe database operations scoped to that context's schema:

**IAM Context Database Service:**

```
// packages/iam/infra/src/db/Db.ts
import { Db } from "@beep/core-db/db.factory";
import * as IamDbSchema from "@beep/iam-tables/schema";

export namespace IamDb {
  const factory = Db.make<typeof IamDbSchema>(IamDbSchema);

  export class IamDb extends Effect.Service<IamDb>()("@beep/iam-infra/IamDb", {
    effect: factory.serviceEffect,
    accessors: true,
  }) {
    static readonly Live = IamDb.Default;
  }

  export const TransactionContext = factory.TransactionContext;
}
```

**Files Context Database Service:**

```
// packages/files/infra/src/db/Db.ts
import { Db } from "@beep/core-db";
import * as SharedDbSchema from "@beep/shared-tables/schema";

export namespace FilesDb {
  const { serviceEffect } = Db.make(SharedDbSchema);

  export class FilesDb extends Context.Tag("@beep/files-infra/FilesDb")<
    FilesDb,
    Db.Db<typeof SharedDbSchema>
  >() {
    static readonly Live: Layer = Layer.scoped(this, serviceEffect);
  }
}
```

**Sources:**[packages/iam/infra/src/db/Db.ts 1-22](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/db/Db.ts#L1-L22)[packages/files/infra/src/db/Db.ts 1-16](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/db/Db.ts#L1-L16)[packages/core/db/src/types.ts 1-37](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/types.ts#L1-L37)

### Database Service Types

The `Db.make` factory generates strongly-typed database services with the following capabilities:

| Type | Purpose | Usage |
| --- | --- | --- |
| `DbClient<TSchema>` | Drizzle database client scoped to schema | Direct query execution |
| `TransactionClient<TSchema>` | Transaction-scoped client | Operations within transactions |
| `ExecuteFn<TSchema>` | Effect-wrapped query executor | Type-safe database operations |
| `Transaction<TSchema>` | Transaction orchestrator | Multi-operation consistency |
| `MakeQuery<TSchema>` | Query builder factory | Reusable query patterns |

**Sources:**[packages/core/db/src/types.ts 8-37](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/db/src/types.ts#L8-L37)

Context Composition at Runtime
------------------------------

### Layer Composition Strategy

Domain contexts compose together at runtime through Effect's Layer system. Each context exposes layers that provide its services, which are merged into a unified runtime:

**Composition Implementation:**

```
// packages/_internal/db-admin/test/pg-container.ts:237-256
const pgClient = PgClient.layer({
  url: Redacted.make(container.getConnectionUri()),
  ssl: false,
  transformQueryNames: Str.camelToSnake,
  transformResultNames: Str.snakeToCamel,
});

const sliceDbLayer = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live);

const reposLayer = Layer.mergeAll(IamRepos.layer, FilesRepos.layer);

const verticalSlicesLayer = Layer.provideMerge(reposLayer, sliceDbLayer);

return Layer.provideMerge(verticalSlicesLayer, pgClient);
```

**Sources:**[packages/_internal/db-admin/test/pg-container.ts 237-256](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/test/pg-container.ts#L237-L256)

### Repository Dependencies

Each domain context declares its infrastructure dependencies in a common file, ensuring consistent layer composition:

**IAM Context Dependencies:**

```
// packages/iam/infra/src/adapters/repos/_common.ts
import { IamDb } from "@beep/iam-infra/db";
export const dependencies = [IamDb.IamDb.Live] as const;
```

**Files Context Dependencies:**

```
// packages/files/infra/src/adapters/repos/_common.ts
import { FilesDb } from "@beep/files-infra/db";
export const dependencies = [FilesDb.FilesDb.Live] as const;
```

**Sources:**[packages/iam/infra/src/adapters/repos/_common.ts 1-3](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/src/adapters/repos/_common.ts#L1-L3)[packages/files/infra/src/adapters/repos/_common.ts 1-3](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/files/infra/src/adapters/repos/_common.ts#L1-L3)

Schema Organization
-------------------

### IAM Schema Tables

The IAM context manages the following database tables (from migration snapshots):

**Core Identity Tables:**

*   `user` - User accounts, authentication credentials, profile data
*   `account` - OAuth provider accounts linked to users
*   `session` - Active user sessions with organization/team context
*   `verification` - Email/phone verification codes

**Organization Tables:**

*   `organization` - Tenant organizations, subscription tiers
*   `team` - Sub-groups within organizations
*   `member` - User membership in organizations with roles
*   `team_member` - User membership in teams

**Authentication & Authorization Tables:**

*   `apikey` - API keys with rate limiting and permissions
*   `passkey` - WebAuthn passkey credentials
*   `two_factor` - TOTP secrets and backup codes
*   `device_code` - OAuth device flow codes

**Sources:**[packages/_internal/db-admin/drizzle/meta/0000_snapshot.json 1-1245](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/meta/0000_snapshot.json#L1-L1245)

### Files Schema Tables

The Files context manages file storage metadata:

**File Tables:**

*   `file` - File metadata, S3 paths, MIME types, entity associations

The file table includes:

*   `url`, `size`, `formatted_size` - File location and size
*   `filename`, `original_filename` - Name handling
*   `base_path`, `path`, `ext` - Path components
*   `mime_type`, `platform` - File type and storage platform
*   `entity_kind`, `entity_identifier`, `entity_attribute` - Entity associations

**Sources:**[packages/_internal/db-admin/drizzle/meta/0000_snapshot.json 504-530](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/drizzle/meta/0000_snapshot.json#L504-L530)

Shared Domain Context
---------------------

The Shared domain provides cross-cutting concerns used by multiple contexts:

**Shared Components:**

*   **EntityId Pattern** - Dual-identifier system (PublicId/PrivateId) used across all entities
*   **Common Value Objects** - Email, URL, timestamp handling
*   **Filter Types** - Query filter specifications for repositories
*   **Policy Framework** - Authorization patterns for protected resources

**Sources:**[packages/core/env/src/server.ts 1-214](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts#L1-L214)[packages/iam/ui/src/sign-up/sign-up-email.form.tsx 1-87](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/ui/src/sign-up/sign-up-email.form.tsx#L1-L87)

Environment Configuration per Context
-------------------------------------

Contexts share a unified environment configuration system but can selectively consume configuration:

**Configuration Access Pattern:**

```
// Server configuration loaded once at startup
export const serverEnv = Effect.runSync(loadConfig);

// Contexts access via ServerConfig service
const program = Effect.gen(function* () {
  const config = yield* ServerConfig;
  const dbUrl = config.db.pg.url;
  // Use configuration...
});
```

**Sources:**[packages/core/env/src/server.ts 24-214](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/server.ts#L24-L214)[packages/core/env/src/client.ts 1-58](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/core/env/src/client.ts#L1-L58)

Cross-Context Communication
---------------------------

### Service Boundaries

Contexts communicate through well-defined service interfaces rather than direct database access:

**Example Cross-Context Usage:**

```
// apps/web/src/app/api/auth/[...all]/route.ts
const program = Effect.flatMap(AuthService, ({ auth }) =>
  Effect.gen(function* () {
    return yield* Effect.succeed(auth.handler);
  })
);

const route = async (req: Request) => {
  const handler = await runServerPromise(program, "auth.route");
  return handler(req);
};
```

**Sources:**[apps/web/src/app/api/auth/[...all]/route.ts:1-19](https://deepwiki.com/kriegcloud/beep-effect/5-domain-contexts)

Testing Strategy for Contexts
-----------------------------

### PgContainer Test Infrastructure

Domain contexts share a common test infrastructure using Docker-based PostgreSQL containers:

**Container Lifecycle:**

1.   **Preflight Check** - Verify Docker availability
2.   **Container Start** - Launch PostgreSQL with pg_uuidv7 extension
3.   **Migration** - Run Drizzle migrations for all schemas
4.   **Seeding** - Insert test data for each context
5.   **Test Execution** - Provide scoped database services
6.   **Cleanup** - Stop container on test completion

**Sources:**[packages/_internal/db-admin/test/pg-container.ts 1-266](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/_internal/db-admin/test/pg-container.ts#L1-L266)

Package Dependencies
--------------------

### IAM Context Dependencies

Key peer dependencies for the IAM infrastructure package:

```
{
  "@beep/core-db": "workspace:^",
  "@beep/core-env": "workspace:^",
  "@beep/core-email": "workspace:^",
  "@beep/iam-domain": "workspace:^",
  "@beep/iam-tables": "workspace:^",
  "@beep/shared-domain": "workspace:^",
  "@beep/shared-tables": "workspace:^",
  "@beep/schema": "workspace:^",
  "better-auth": "*",
  "@better-auth/stripe": "*",
  "stripe": "*"
}
```

**Sources:**[packages/iam/infra/package.json 77-94](https://github.com/kriegcloud/beep-effect/blob/b64126f6/packages/iam/infra/package.json#L77-L94)

Summary
-------

Domain contexts in beep-effect implement bounded contexts with:

*   **Vertical Slice Architecture** - Five-layer structure (domain, tables, infra, sdk, ui)
*   **Strict Boundaries** - Unidirectional dependencies, no cross-layer violations
*   **Type-Safe Database Services** - Per-context database services via `Db.make` factory
*   **Effect Layer Composition** - Runtime composition using Effect's dependency injection
*   **Shared Infrastructure** - Common patterns via Shared domain and core packages
*   **Testability** - Docker-based PostgreSQL container for isolated testing

Each context can evolve independently while maintaining clear integration points through well-defined service interfaces and shared infrastructure patterns.
