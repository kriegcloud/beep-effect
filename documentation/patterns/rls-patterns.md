# Row-Level Security Patterns

## Overview

Row-Level Security (RLS) provides database-level multi-tenant isolation in beep-effect. When enabled, PostgreSQL automatically filters query results based on the current tenant context, ensuring organizations can never see each other's data even if application code has bugs.

### What RLS Provides

- **Defense in Depth**: Database enforces isolation even if application logic fails
- **Automatic Filtering**: All SELECT/INSERT/UPDATE/DELETE operations filtered
- **Zero Trust**: Queries without context return empty results (not errors)
- **Audit Trail**: Policy violations logged at database level

## Architecture

### Session Variable Pattern

beep-effect uses PostgreSQL session variables for tenant context:

```sql
-- Set context before queries
SET app.current_org_id = 'org-uuid-here';

-- All subsequent queries filtered by context
SELECT * FROM iam_member;  -- Only returns rows for org-uuid-here
```

### Policy Structure

All tenant-scoped tables have a `tenant_isolation_{table}` policy:

```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_{table} ON {table}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

**Key components**:
- `FOR ALL` - Applies to SELECT, INSERT, UPDATE, DELETE
- `USING` - Filters existing rows (SELECT, UPDATE, DELETE)
- `WITH CHECK` - Validates new/modified rows (INSERT, UPDATE)
- `NULLIF(..., '')` - Converts empty string to NULL (blocks all rows if no context)
- `current_setting('...', TRUE)` - Returns empty string if not set (TRUE prevents error)

### Admin Bypass

The `rls_bypass_admin` role bypasses RLS for migrations and admin operations:

```sql
CREATE ROLE rls_bypass_admin WITH BYPASSRLS NOLOGIN;
```

## TenantContext Service

### Service Location

`packages/shared/server/src/TenantContext/TenantContext.ts`

### Basic Usage

```typescript
import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server";

const myEffect = Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;

  // Set context for subsequent queries
  yield* ctx.setOrganizationId("org-123");

  // Query now scoped to org-123
  const members = yield* memberRepo.findAll();
});
```

### With Organization Scope

```typescript
const result = yield* ctx.withOrganization("org-123",
  Effect.gen(function* () {
    const members = yield* memberRepo.findAll();
    const documents = yield* documentRepo.findAll();
    // Both queries scoped to org-123
    return { members, documents };
  })
);
```

### Clear Context

```typescript
yield* ctx.clearContext();  // Resets to empty string (blocks all rows)
```

### Layer Composition

```typescript
import { TenantContext } from "@beep/shared-server";
import { DbClient } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

// TenantContext requires SqlClient.SqlClient
const TenantContextLive = TenantContext.TenantContext.layer.pipe(
  Layer.provide(DbClient.layer)
);

// Compose with slice-specific Db layers
const AppLayer = Layer.mergeAll(
  TenantContextLive,
  IamDb.layer,
  IamRepos.layer
);

// Usage in request handler
const handler = Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;
  yield* ctx.setOrganizationId(session.organizationId);

  // All subsequent queries are filtered by RLS
  const members = yield* MemberRepo.findAll();
  return members;
});
```

## Adding RLS to a New Slice

### Step 1: Identify Org-Scoped Tables

Tables requiring RLS:
- Tables using `OrgTable.make()` (automatic `organizationId`)
- Tables with manual `organizationId` column

Check existing patterns:
```bash
grep -r "OrgTable.make" packages/*/tables/src/
```

### Step 2: Add Organization ID Index

Before creating RLS policies, ensure `organization_id` has an index for performance:

```typescript
// In your *.table.ts file
import { index } from "drizzle-orm/pg-core";

export const myTable = OrgTable.make(
  "my_slice",
  "entity",
  (table) => ({
    // ... columns
  }),
  (table) => [
    index("my_slice_entity_organization_id_rls_idx").on(table.organizationId),
    // ... other indexes
  ]
);
```

### Step 3: Create Migration

Add a custom SQL migration to `packages/_internal/db-admin/drizzle/`:

```sql
-- {timestamp}_enable_rls_{slice}.sql

-- Enable RLS
ALTER TABLE {slice}_{table} ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation_{slice}_{table} ON {slice}_{table}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### Step 4: Update Migration Journal

Add an entry to `drizzle/meta/_journal.json`:

```json
{
  "idx": 2,
  "version": "7",
  "when": 1737000000000,
  "tag": "0002_enable_rls_{slice}",
  "breakpoints": true
}
```

### Step 5: Test with RLS Helpers

```typescript
import { layer, strictEqual } from "@beep/testkit";
import { assertNoRowsWithoutContext, TenantContextTag } from "@beep/testkit/rls";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { TenantContext } from "@beep/shared-server";

// Create test layer with TenantContext mapped to TenantContextTag
const TestLayer = PgTest.pipe(
  Layer.provideMerge(
    Layer.effect(
      TenantContextTag,
      Effect.gen(function* () {
        return yield* TenantContext.TenantContext;
      })
    )
  )
);

layer(TestLayer, { timeout: Duration.seconds(60) })("New Slice RLS", (it) => {
  it.effect("blocks queries without context", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const result = yield* sql`SELECT * FROM new_slice_table LIMIT 10`;
      strictEqual(result.length, 0);
    })
  );

  it.effect("returns data with context", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const sql = yield* SqlClient.SqlClient;

      const result = yield* ctx.withOrganization("test-org-123",
        sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`
      );

      strictEqual(result[0].org_id, "test-org-123");
    })
  );
});
```

## Connection Pooling Considerations

### Why SET (not SET LOCAL)

beep-effect uses session-level `SET` instead of transaction-scoped `SET LOCAL`:

| Approach | Scope | With Connection Pooling |
|----------|-------|-------------------------|
| `SET LOCAL` | Current transaction only | Fails - queries may use different connections |
| `SET` | Entire session/connection | Works - setting persists for connection lifetime |

**The Problem with SET LOCAL**:
1. Connection pool has multiple connections
2. `SET LOCAL` sets context on connection A
3. Next query may be routed to connection B
4. Connection B has no context - empty results

**The Solution**:
Session-level `SET` persists for the connection's lifetime, ensuring all queries on that connection see the context.

### SQL Injection Prevention

PostgreSQL's SET statement doesn't support parameterized queries:

```typescript
// WRONG - causes "syntax error at $1"
yield* sql`SET app.current_org_id = ${orgId}`;

// CORRECT - manual escaping via TenantContext service
const escapeOrgId = (id: string) => id.replace(/'/g, "''");
yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);
```

**Note**: The TenantContext service handles this escaping internally. Always use the service rather than setting context manually.

## Testing

### Available Test Helpers

Import from `@beep/testkit/rls`:

| Helper | Purpose |
|--------|---------|
| `withTestTenant(orgId, effect)` | Execute effect with tenant context |
| `setTestTenant(orgId)` | Set tenant context |
| `clearTestTenant()` | Clear tenant context |
| `assertNoRowsWithoutContext(query)` | Verify RLS blocks without context |
| `assertTenantIsolation(orgA, orgB, query)` | Verify cross-tenant isolation |
| `assertTenantIsolationForSession(orgA, orgB, query)` | For session table (uses `activeOrganizationId`) |
| `assertInsertRequiresContext(orgId, insertFn)` | Verify INSERT blocked without context |

### TenantContextTag for Layer Composition

The test helpers use `TenantContextTag` which must be provided in test layers:

```typescript
import { TenantContextTag } from "@beep/testkit/rls";
import { TenantContext } from "@beep/shared-server";
import * as Layer from "effect/Layer";

const TestLayer = BaseTestLayer.pipe(
  Layer.provideMerge(
    Layer.effect(
      TenantContextTag,
      Effect.gen(function* () {
        return yield* TenantContext.TenantContext;
      })
    )
  )
);
```

### Example Integration Test

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { TenantContext } from "@beep/shared-server";
import { PgTest } from "../container";

layer(PgTest, { timeout: Duration.seconds(60) })("RLS Tenant Isolation", (it) => {
  it.effect("blocks SELECT without tenant context", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const result = yield* sql`SELECT * FROM iam_member LIMIT 10`;
      strictEqual(result.length, 0);
    })
  );

  it.effect("withOrganization sets context for nested queries", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const sql = yield* SqlClient.SqlClient;

      const result = yield* ctx.withOrganization("test-org-123",
        sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`
      );

      strictEqual(result[0].org_id, "test-org-123");
    })
  );
});
```

## Tables with RLS

### IAM Slice (9 tables)

| Table | Policy |
|-------|--------|
| `iam_member` | `tenant_isolation_iam_member` |
| `iam_team_member` | `tenant_isolation_iam_team_member` |
| `iam_organization_role` | `tenant_isolation_iam_organization_role` |
| `iam_subscription` | `tenant_isolation_iam_subscription` |
| `iam_two_factor` | `tenant_isolation_iam_two_factor` |
| `iam_apikey` | `tenant_isolation_iam_apikey` |
| `iam_invitation` | `tenant_isolation_iam_invitation` |
| `iam_sso_provider` | `tenant_isolation_iam_sso_provider` |
| `iam_scim_provider` | `tenant_isolation_iam_scim_provider` |

### Shared Slice (5 tables)

| Table | Policy | Note |
|-------|--------|------|
| `shared_team` | `tenant_isolation_shared_team` | |
| `shared_file` | `tenant_isolation_shared_file` | |
| `shared_folder` | `tenant_isolation_shared_folder` | |
| `shared_upload_session` | `tenant_isolation_shared_upload_session` | |
| `shared_session` | `tenant_isolation_shared_session` | Uses `active_organization_id` |

### Documents Slice (5 tables)

| Table | Policy |
|-------|--------|
| `documents_document` | `tenant_isolation_documents_document` |
| `documents_discussion` | `tenant_isolation_documents_discussion` |
| `documents_comment` | `tenant_isolation_documents_comment` |
| `documents_document_file` | `tenant_isolation_documents_document_file` |
| `documents_document_version` | `tenant_isolation_documents_document_version` |

### Knowledge Slice (1 table)

| Table | Policy |
|-------|--------|
| `knowledge_embedding` | `tenant_isolation_knowledge_embedding` |

## Troubleshooting

### "Empty result set when expecting data"

**Cause**: Tenant context not set before query

**Solution**: Ensure `setOrganizationId` is called:
```typescript
const ctx = yield* TenantContext.TenantContext;
yield* ctx.setOrganizationId("your-org-id");  // Add this
const result = yield* repo.findAll();
```

### "syntax error at or near $1"

**Cause**: Using parameterized query with SET statement

**Solution**: Use the TenantContext service which handles this internally. If implementing custom context, use `sql.unsafe()` with manual escaping.

### "Context not persisting between queries"

**Cause**: Using `SET LOCAL` instead of `SET`

**Solution**: The TenantContext service uses session-level `SET`. If implementing custom context, avoid `SET LOCAL` when using connection pooling.

### "RLS policy violation" errors

**Cause**: INSERT/UPDATE with `organizationId` different from context

**Solution**: Ensure row's `organizationId` matches the current context:
```typescript
yield* ctx.setOrganizationId("org-123");
yield* repo.insert({
  organizationId: "org-123",  // Must match context
  // ... other fields
});
```

### "Permission denied" during migrations

**Cause**: Migration running without admin bypass

**Solution**: Use the `rls_bypass_admin` role for migrations:
```sql
SET ROLE rls_bypass_admin;
-- Run migration
RESET ROLE;
```

### "Expected X rows, got 0" in tests

**Cause**: Test data inserted without proper context, or TenantContextTag not provided

**Solution**:
1. Ensure TenantContextTag is mapped in your test Layer
2. Insert test data with the same org context you're querying with:
```typescript
yield* ctx.setOrganizationId("test-org");
yield* repo.insert({ organizationId: "test-org", ... });
// Query will now see the inserted data
const result = yield* repo.findAll();
```

## Special Cases

### Session Table

The `shared_session` table uses `active_organization_id` instead of `organization_id`:

```sql
CREATE POLICY tenant_isolation_shared_session ON shared_session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

Use `assertTenantIsolationForSession` instead of `assertTenantIsolation` when testing this table.

### Nullable Organization ID

Some tables (`iam_invitation`, `iam_sso_provider`, `iam_scim_provider`) have nullable `organization_id`. The current RLS policy hides rows with NULL `organization_id` when context is set. If NULL represents "global" resources that should be visible to all, consider a policy adjustment:

```sql
-- Alternative policy allowing NULL organization rows to be visible
USING (
  organization_id IS NULL
  OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
)
```

## Performance Considerations

### Indexes

All org-scoped tables should have an index on `organization_id`:

```sql
CREATE INDEX {table}_organization_id_rls_idx ON {table} (organization_id);
```

Without this index, RLS policies cause full table scans for every filtered query.

### Query Plans

RLS adds a filter condition to every query. Monitor query plans with:

```sql
EXPLAIN ANALYZE SELECT * FROM iam_member WHERE ...;
```

The filter should use the `organization_id` index, not sequential scan.

### Connection Overhead

Setting session context (`SET app.current_org_id`) is a lightweight operation. However, if you need to switch contexts frequently within a request, consider restructuring to minimize context switches.

## Migration Checklist

When adding RLS to a new slice:

- [ ] Identify all org-scoped tables
- [ ] Add `organization_id` indexes to each table
- [ ] Run `bun run db:generate` to create index migrations
- [ ] Create custom SQL migration for RLS policies
- [ ] Update migration journal
- [ ] Run `bun run db:migrate`
- [ ] Write integration tests using RLS helpers
- [ ] Verify with `bun run test --filter @beep/db-admin`
- [ ] Update this documentation with new tables
