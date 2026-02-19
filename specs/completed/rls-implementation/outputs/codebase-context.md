# Codebase Context: RLS Implementation

> Complete research findings for Row-Level Security implementation.

**Generated**: 2026-01-18
**Source**: Analysis of existing beep-effect multi-tenant patterns
**Phase**: P0 - Research & Discovery (COMPLETE)

---

## Executive Summary

The beep-effect monorepo uses PostgreSQL with Drizzle ORM for multi-tenant data storage. All org-scoped tables use the `OrgTable.make()` factory which automatically adds an `organizationId` foreign key. However, **no RLS policies are currently implemented** - tenant isolation relies entirely on application-level WHERE clauses.

**Key Finding**: 21 tables require RLS policies for multi-tenant isolation.

---

## Complete Table Inventory

### Summary by Category

| Category | Tables Requiring RLS | Tables Without RLS | Total |
|----------|---------------------|-------------------|-------|
| IAM      | 8                   | 12                | 20    |
| Shared   | 5                   | 2                 | 7     |
| Documents| 5                   | 0                 | 5     |
| Comms    | 1                   | 0                 | 1     |
| Knowledge| 1                   | 0                 | 1     |
| Other    | 1                   | 1                 | 2     |
| **Total**| **21**              | **15**            | **36**|

---

### Tables Requiring RLS (21 Total)

#### Using OrgTable.make (17 tables)

These tables have automatic `organizationId` column with FK constraints:

| Table | Package | Has orgId Index | Index Name |
|-------|---------|-----------------|------------|
| `member` | `@beep/iam-tables` | Yes | `member_organization_id_idx` |
| `teamMember` | `@beep/iam-tables` | No | - |
| `organizationRole` | `@beep/iam-tables` | No | - |
| `subscription` | `@beep/iam-tables` | No | - |
| `twoFactor` | `@beep/iam-tables` | No | - |
| `apiKey` | `@beep/iam-tables` | No | - |
| `team` | `@beep/shared-tables` | Yes | `team_organization_id_idx` |
| `file` | `@beep/shared-tables` | No | - |
| `folder` | `@beep/shared-tables` | No | - |
| `uploadSession` | `@beep/shared-tables` | No | - |
| `document` | `@beep/documents-tables` | No | - |
| `discussion` | `@beep/documents-tables` | No | - |
| `comment` | `@beep/documents-tables` | No | - |
| `documentFile` | `@beep/documents-tables` | No | - |
| `documentVersion` | `@beep/documents-tables` | No | - |
| `emailTemplate` | `@beep/comms-tables` | Yes | `idx_org_id` |
| `embedding` | `@beep/knowledge-tables` | No | - |

#### Using Table.make with organizationId (4 tables)

These tables have `organizationId` but use `Table.make` instead of `OrgTable.make`:

| Table | Package | Has orgId Index | Notes |
|-------|---------|-----------------|-------|
| `invitation` | `@beep/iam-tables` | Yes | Uses `Table.make`, has `invitation_organization_id_idx` |
| `ssoProvider` | `@beep/iam-tables` | No | Uses `Table.make`, nullable organizationId |
| `scimProvider` | `@beep/iam-tables` | No | Uses `Table.make`, nullable organizationId |
| `session` | `@beep/shared-tables` | Yes | Uses `Table.make`, has `activeOrganizationId` with `session_active_org_idx` |

**Session Table Note**: The `session` table has `activeOrganizationId` to track the user's current organization context. This may need a different RLS strategy (allow access if user is a member of the org).

---

### Tables NOT Requiring RLS (15 Total)

#### Global Tables (System-Wide)

| Table | Package | Reason |
|-------|---------|--------|
| `organization` | `@beep/shared-tables` | Parent tenant entity - no scoping needed |
| `user` | `@beep/shared-tables` | Global user entity - users exist across orgs |
| `account` | `@beep/iam-tables` | User-level auth accounts (OAuth links) |
| `verification` | `@beep/iam-tables` | Email verification tokens - user-scoped |
| `passkey` | `@beep/iam-tables` | User WebAuthn credentials |
| `jwks` | `@beep/iam-tables` | System-wide cryptographic keys |
| `rateLimit` | `@beep/iam-tables` | System rate limiting state |
| `walletAddress` | `@beep/iam-tables` | User crypto wallet addresses |
| `deviceCode` | `@beep/iam-tables` | OAuth device flow tokens |
| `oauthClient` | `@beep/iam-tables` | OAuth application registrations |
| `oauthConsent` | `@beep/iam-tables` | User OAuth consent records |
| `oauthAccessToken` | `@beep/iam-tables` | OAuth access tokens |
| `oauthRefreshToken` | `@beep/iam-tables` | OAuth refresh tokens |

#### Placeholder/Incomplete Tables

| Table | Package | Notes |
|-------|---------|-------|
| `calendarEvent` | `@beep/calendar-tables` | Placeholder - no org scoping, likely incomplete |
| `userHotkey` | `@beep/customization-tables` | User-level preferences - no org scoping |

---

## Index Requirements for RLS Performance

### Tables Needing organizationId Index

For RLS policies to perform well, each table needs an index on `organization_id`. Current state:

| Table | Has Index | Action Required |
|-------|-----------|-----------------|
| `member` | Yes | None |
| `team` | Yes | None |
| `emailTemplate` | Yes | None |
| `invitation` | Yes | None |
| `session` | Yes | None (`session_active_org_idx` on `activeOrganizationId`) |
| `teamMember` | **No** | Add index |
| `organizationRole` | **No** | Add index |
| `subscription` | **No** | Add index |
| `twoFactor` | **No** | Add index |
| `apiKey` | **No** | Add index |
| `file` | **No** | Add index |
| `folder` | **No** | Add index |
| `uploadSession` | **No** | Add index |
| `document` | **No** | Add index |
| `discussion` | **No** | Add index |
| `comment` | **No** | Add index |
| `documentFile` | **No** | Add index |
| `documentVersion` | **No** | Add index |
| `embedding` | **No** | Add index |
| `ssoProvider` | **No** | Add index |
| `scimProvider` | **No** | Add index |

**Total indexes to add**: 16

---

## OrgTable Factory Pattern

### Source: `packages/shared/tables/src/org-table/OrgTable.ts`

The `OrgTable.make()` factory automatically:
1. Adds `organizationId` column with foreign key to `organization.id`
2. Configures cascade delete (`onDelete: 'cascade'`)
3. Includes all `globalColumns` (audit fields, versioning, etc.)

```typescript
// From OrgTable.ts:61-75
const defaultColumns: OrgDefaultColumns<TableName, Brand> = {
  id: entityId.publicId(),
  _rowId: entityId.privateId(),
  organizationId: pg
    .text("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),
  ...globalColumns,
};
```

---

## Db Service Pattern

### Source: `packages/iam/server/src/db/Db/Db.ts`

Each slice creates a typed Db service using `DbClient.make()`:

```typescript
import * as DbSchema from "@beep/iam-tables/schema";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect = DbClient.make({ schema: DbSchema });

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag("@beep/iam-server/Db")<Db, Shape>() {}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> =
  Layer.scoped(Db, serviceEffect);
```

### Current Query Pattern (No RLS)

Queries currently filter by `organizationId` at the application level:

```typescript
// Current pattern - application-level filtering
const findMembersByOrg = (orgId: string) =>
  Effect.gen(function* () {
    const { db } = yield* Db;
    return yield* db
      .select()
      .from(member)
      .where(eq(member.organizationId, orgId));
  });
```

**Risk**: If a developer forgets the WHERE clause, data leaks across tenants.

---

## PostgreSQL Session Variable Pattern

### How RLS Will Work

```sql
-- Policy definition (one-time, in migration)
CREATE POLICY tenant_isolation_member ON member
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid)
  WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

-- Enable RLS on table
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
```

### Connection Setup (per request)

```sql
-- Set at beginning of request/transaction
SET LOCAL app.current_org_id = 'uuid-value';

-- All subsequent queries automatically filtered
SELECT * FROM member;  -- Only returns rows for this org
```

### Null Handling

Use `NULLIF` to prevent queries when context not set:

```sql
USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::uuid)
```

---

## Effect Integration Point

### Proposed TenantContext Service

The tenant context should be set at the Effect Layer level, integrated with the existing `PgClient`:

```typescript
// packages/shared/server/src/TenantContext/TenantContext.ts
import * as SqlClient from "@effect/sql/SqlClient";
import * as Effect from "effect/Effect";

export class TenantContext extends Effect.Service<TenantContext>()(
  "@beep/shared-server/TenantContext",
  {
    dependencies: [SqlClient.SqlClient],
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      return {
        setOrganizationId: (orgId: string) =>
          sql`SET LOCAL app.current_org_id = ${orgId}`,
        clearContext: () =>
          sql`RESET app.current_org_id`,
      };
    }),
  }
) {}
```

### Integration with Transaction Pattern

The existing `transaction` method in `PgClient.ts` wraps queries in a transaction. The tenant context should be set at the start of each transaction:

```typescript
// Proposed enhancement to transaction wrapper
const transactionWithTenant = (orgId: string) => (txExecute) =>
  transaction((tx) =>
    Effect.gen(function* () {
      yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
      return yield* txExecute(tx);
    })
  );
```

---

## Migration Infrastructure

### Location: `packages/_internal/db-admin/`

- `drizzle.config.ts` - Drizzle Kit configuration
- `src/schema.ts` - Unified schema for migrations
- `drizzle/` - Generated SQL migrations

### Adding Custom Migrations

Drizzle supports custom SQL migrations. RLS policies should be added via:

```sql
-- drizzle/XXXX_rls_policies.sql

-- Enable RLS on all org-scoped tables
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
-- ... for all 21 tables

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_member ON member
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::uuid);

-- ... for all 21 tables
```

---

## Key Reference Files

| File | Purpose |
|------|---------|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Table factory |
| `packages/iam/tables/src/tables/member.table.ts` | Example org table |
| `packages/iam/server/src/db/Db/Db.ts` | Db service pattern |
| `packages/shared/server/src/factories/db-client/pg/PgClient.ts` | PgClient with transaction support |
| `packages/_internal/db-admin/drizzle.config.ts` | Migration config |

---

## Next Steps (Phase 1)

1. Add missing `organization_id` indexes (16 tables)
2. Create TenantContext Effect service
3. Integrate tenant context with transaction wrapper
4. Create RLS policy migrations for all 21 tables
5. Update Better Auth hooks to set tenant context
6. Add comprehensive testing for tenant isolation
