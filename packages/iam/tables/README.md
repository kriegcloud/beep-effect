# @beep/iam-tables

Drizzle schema package for the IAM slice. Defines Postgres table builders, enums, and relations that back authentication, authorization, and organization membership features throughout the beep-effect system.

## Purpose

Supplies IAM-specific Drizzle tables, enums, and relations layered on top of shared table factories from `@beep/shared-tables`. This package:

- Bridges `@beep/iam-domain` entity codecs to persistent storage
- Ensures IAM tables are multi-tenant aware via `OrgTable.make` and `Table.make` factories
- Re-exports shared tables (`organization`, `team`, `user`, `session`) to keep infra consumers on a single schema namespace
- Provides compile-time alignment checks between Drizzle models and Effect schemas
- Partners with `@beep/shared-server`'s `Db.make` to wire up typed `SqlClient` layers

## Key Exports

| Export | Description |
|--------|-------------|
| `IamDbSchema` | Namespace aggregating all IAM tables, relations, and shared table re-exports |
| `account` | OAuth/credential accounts linked to users |
| `session` | User authentication sessions with organization context |
| `member` | Organization membership with roles and status tracking |
| `teamMember` | Team membership within organizations |
| `invitation` | Organization/team invitations with status tracking |
| `passkey` | WebAuthn passkey credentials |
| `twoFactor` | Two-factor authentication settings |
| `apiKey` | Programmatic API access tokens |
| `oauthApplication` | Registered OAuth applications |
| `oauthAccessToken` | OAuth access tokens |
| `oauthConsent` | User OAuth consent records |
| `ssoProvider` | SSO provider configurations |
| `scimProvider` | SCIM provider integrations |
| `organizationRole` | Custom organization roles |
| `subscription` | Organization subscription details |
| `deviceCode` | OAuth device flow codes |
| `jwks` | JSON Web Key Sets |
| `rateLimit` | API rate limiting records |
| `verification` | Email/phone verification tokens |
| `walletAddress` | Blockchain wallet addresses |

## Architecture Fit

- **Vertical Slice Layer**: Tables layer sits between `domain` and `infra`, defining persistence schema
- **Better Auth Integration**: Schema designed to work with better-auth adapter requirements
- **Multi-Tenant**: Uses `OrgTable.make` for tenant-scoped resources, `Table.make` for global artifacts
- **Type Safety**: `_check.ts` ensures Drizzle `InferSelectModel` / `InferInsertModel` match domain schemas
- **Path Alias**: Import as `@beep/iam-tables`. The public surface exports `IamDbSchema` from `src/index.ts`

## Module Structure

```
src/
├── tables/              # Drizzle table definitions
│   ├── account.table.ts
│   ├── member.table.ts
│   ├── session.table.ts
│   └── ...
├── relations.ts         # Drizzle relations definitions
├── schema.ts           # Aggregates tables and relations
├── index.ts            # Public API (exports IamDbSchema namespace)
└── _check.ts           # Compile-time type alignment assertions
```

## Usage

### Import the Schema Namespace

The primary export is the `IamDbSchema` namespace, which aggregates all tables and relations:

```typescript
import { IamDbSchema } from "@beep/iam-tables";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";

// Access tables
const memberTable = IamDbSchema.member;
const userTable = IamDbSchema.user;
```

### Wire with Database Layer

Pass the schema to `Db.make` to create a typed database client:

```typescript
import { Schema } from "@beep/iam-tables/schema-object";
import { Db } from "@beep/shared-server/Db";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect = Db.make({
  schema: Schema,
});

export type Shape = Db.Shape<typeof Schema>;

export class IamDb extends Context.Tag("@beep/iam-server/IamDb")<IamDb, Shape>() {
  static readonly Live = Layer.scoped(this, serviceEffect);
}
```

### Query with Type Safety

Use the schema in Effect-based queries:

```typescript
import { IamDb } from "@beep/iam-server/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import { eq } from "drizzle-orm";

export const listActiveMembers = (organizationId: string) =>
  Effect.gen(function* () {
    const { db } = yield* IamDb.IamDb;

    const rows = yield* db
      .select({
        memberId: IamDbSchema.member.id,
        userId: IamDbSchema.member.userId,
        role: IamDbSchema.member.role,
      })
      .from(IamDbSchema.member)
      .where(eq(IamDbSchema.member.organizationId, organizationId));

    return F.pipe(
      rows,
      A.map((row) => row.memberId)
    );
  });
```

### Define Custom Tables

Create a tenant-scoped table using `OrgTable.make`:

```typescript
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const auditLog = OrgTable.make(IamEntityIds.AuditLogId)(
  {
    action: pg.text("action").notNull(),
    performedBy: pg.text("performed_by").notNull(),
    metadata: pg.jsonb("metadata"),
  },
  (t) => [
    // Indexes
    pg.index("audit_log_org_action_idx").on(t.organizationId, t.action),
    pg.index("audit_log_performed_by_idx").on(t.performedBy),
  ]
);
```

### Add Relations

Define Drizzle relations for the new table:

```typescript
import { auditLog } from "./tables/auditLog.table";
import { organization, user } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";

export const auditLogRelations = d.relations(auditLog, ({ one }) => ({
  organization: one(organization, {
    fields: [auditLog.organizationId],
    references: [organization.id],
  }),
  performer: one(user, {
    fields: [auditLog.performedBy],
    references: [user.id],
  }),
}));
```

### Add Type Alignment Checks

Extend `_check.ts` when adding new tables:

```typescript
import type { AuditLog } from "@beep/iam-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectAuditLog: typeof AuditLog.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.auditLog>;

export const _checkInsertAuditLog: typeof AuditLog.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.auditLog>;
```

## Table Categories

### Authentication Artifacts
- `account` — OAuth/credential provider accounts
- `session` — User sessions with active organization context
- `passkey` — WebAuthn credentials
- `twoFactor` — Two-factor authentication settings
- `deviceCode` — OAuth device flow authorization codes
- `verification` — Email/phone verification tokens
- `jwks` — JSON Web Key Sets for OAuth

### Organization & Membership
- `member` — Organization membership with roles
- `teamMember` — Team membership within organizations
- `invitation` — Invitations to organizations/teams
- `organizationRole` — Custom organization role definitions
- `subscription` — Organization subscription data

### OAuth & SSO
- `oauthApplication` — Registered OAuth applications
- `oauthAccessToken` — Issued access tokens
- `oauthConsent` — User consent records
- `ssoProvider` — SSO provider configurations
- `scimProvider` — SCIM integration providers

### Access Control
- `apiKey` — Programmatic API keys
- `rateLimit` — API rate limiting state

### Auxiliary
- `walletAddress` — Blockchain wallet addresses linked to users

### Shared Tables (Re-exported)
- `organization` — From `@beep/shared-tables`
- `team` — From `@beep/shared-tables`
- `user` — From `@beep/shared-tables`
- `session` — From `@beep/shared-tables`
- `file` — From `@beep/shared-tables`

## What Belongs Here

- **Drizzle table definitions** using `Table.make` or `OrgTable.make`
- **Postgres enum builders** via domain kit helpers (e.g., `Member.makeMemberRolePgEnum`)
- **Drizzle relations** mapping foreign keys to logical relationships
- **Type alignment checks** in `_check.ts` for Drizzle ↔ Effect schema compatibility
- **Index definitions** for query performance optimization
- **Shared table re-exports** for IAM infra convenience

## What Must NOT Go Here

- **No business logic**: domain rules belong in `@beep/iam-domain`
- **No queries or repositories**: those belong in `@beep/iam-server`
- **No migrations**: SQL migrations live in `packages/_internal/db-admin`
- **No Effect services**: table factories are pure, no Layer/Context/Effect execution
- **No shared table edits**: changes to `organization`, `team`, `user` go in `@beep/shared-tables`

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@effect/sql` | SQL modeling types |
| `@effect/experimental` | Experimental Effect features |
| `drizzle-orm` | Postgres ORM and schema builders |
| `@beep/shared-tables` | Table factories (`Table.make`, `OrgTable.make`) |
| `@beep/shared-domain` | Entity ID definitions |
| `@beep/iam-domain` | IAM entity schemas and enum builders |
| `@beep/schema` | Core schema utilities |
| `@beep/utils` | Pure runtime helpers |
| `@beep/invariant` | Assertion contracts |
| `uuid` | UUID generation |
| `mutative` | Immutable updates |

## Development

```bash
# Type check
bun run --filter @beep/iam-tables check

# Lint
bun run --filter @beep/iam-tables lint

# Lint and auto-fix
bun run --filter @beep/iam-tables lint:fix

# Build
bun run --filter @beep/iam-tables build

# Run tests
bun run --filter @beep/iam-tables test

# Test with coverage
bun run --filter @beep/iam-tables coverage

# Check for circular dependencies
bun run --filter @beep/iam-tables lint:circular
```

## Guidelines for Modifying Tables

### When Adding Tables

1. **Register Entity ID** in `@beep/shared-domain/entity-ids` first
2. **Choose Factory**: Use `OrgTable.make` for tenant-scoped, `Table.make` for global
3. **Generate Enums** via domain kits (e.g., `MyEntity.makeStatusPgEnum`)
4. **Define Indexes** for foreign keys and common query patterns
5. **Add Relations** in `src/relations.ts` matching foreign key constraints
6. **Extend `_check.ts`** to verify Drizzle types match domain schemas
7. **Coordinate Migrations** in `packages/_internal/db-admin`

### When Modifying Columns

1. **Update Domain Schema** in `@beep/iam-domain` first
2. **Update Table Definition** to match
3. **Update `_check.ts`** to catch type mismatches
4. **Generate Migration** via `bun run db:generate`
5. **Test Migration** locally before committing

### Effect-First Patterns

Always use Effect utilities in examples and helpers:

```typescript
// Import namespaces
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

// Use Effect Array methods
F.pipe(items, A.map((item) => item.id));
F.pipe(items, A.filter((item) => item.active));

// Use Effect String methods
F.pipe(str, Str.trim, Str.toLowerCase);

// Never use native array/string/object methods
// items.map(...) ❌
// str.trim() ❌
```

### Multi-Tenant Defaults

Use `OrgTable.make` for resources scoped to organizations:

```typescript
// Automatically includes organizationId with proper cascade
export const notification = OrgTable.make(IamEntityIds.NotificationId)({
  message: pg.text("message").notNull(),
  readAt: pg.timestamp("read_at"),
});
```

Use `Table.make` for global resources:

```typescript
// Global resource, no organizationId
export const systemLog = Table.make(IamEntityIds.SystemLogId)({
  level: pg.text("level").notNull(),
  message: pg.text("message").notNull(),
});
```

## Testing

- Unit tests colocated in `test/` directory
- Use Vitest via `bun test`
- Test table definitions, enum generation, and relation logic
- Leverage `@beep/testkit` for Effect-based test utilities

## Integration with Better Auth

This schema is designed to work with better-auth's Drizzle adapter:

```typescript
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { IamDbSchema } from "@beep/iam-tables";

const adapter = drizzleAdapter(db, {
  provider: "pg",
  schema: IamDbSchema,
});
```

The `account`, `session`, `user`, and other tables follow better-auth's expected structure while extending with organization context and multi-tenancy.

## Relationship to Other Packages

- `@beep/iam-domain` — Entity schemas and value objects that tables persist
- `@beep/iam-server` — Repositories and services that query these tables
- `@beep/shared-tables` — Provides `Table.make`, `OrgTable.make`, and shared tables
- `@beep/shared-server` — Database factory that consumes this schema
- `packages/_internal/db-admin` — Migration warehouse for schema changes

## Versioning and Changes

- Tables are foundational to IAM — prefer **additive** changes
- For breaking schema changes:
  - Update domain schemas first
  - Coordinate migrations with SQL changes
  - Update infra repositories in same PR
  - Test with Testcontainers before merging

## Further Reading

- `packages/iam/tables/AGENTS.md` — Detailed authoring guide
- `packages/shared/tables/AGENTS.md` — Table factory patterns
- `packages/_internal/db-admin/AGENTS.md` — Migration workflow
- `documentation/patterns/` — Implementation recipes
