# Phase 4 Orchestrator Prompt

> Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 (Documentation) of the RLS Implementation spec for beep-effect.

### Context

Phase 3 is complete. Testing infrastructure working:
- **RLS Test Helpers**: `tooling/testkit/src/rls/` - `withTestTenant`, `setTestTenant`, `clearTestTenant`, `assertNoRowsWithoutContext`, `assertTenantIsolation`
- **Integration Tests**: `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts` - 11 tests, all passing
- **TenantContext Service**: Uses session-level `SET` (not `SET LOCAL`) due to connection pooling
- **SQL Injection Protection**: Manual quote escaping for SET statements

### Your Mission

Create comprehensive RLS documentation and update AGENTS.md files.

---

#### Task 1: Create RLS Pattern Documentation

Create `documentation/patterns/rls-patterns.md`:

```markdown
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

## Adding RLS to a New Slice

### Step 1: Identify Org-Scoped Tables

Tables requiring RLS:
- Tables using `OrgTable.make()` (automatic `organizationId`)
- Tables with manual `organizationId` column

Check existing patterns:
```bash
grep -r "OrgTable.make" packages/*/tables/src/
```

### Step 2: Create Migration

Add to `packages/_internal/db-admin/drizzle/`:

```sql
-- Enable RLS
ALTER TABLE {slice}_{table} ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation_{slice}_{table} ON {slice}_{table}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### Step 3: Add Index (if missing)

```sql
CREATE INDEX IF NOT EXISTS {slice}_{table}_organization_id_rls_idx
  ON {slice}_{table} (organization_id);
```

### Step 4: Test with RLS Helpers

```typescript
import { layer, strictEqual } from "@beep/testkit";
import { withTestTenant, assertNoRowsWithoutContext } from "@beep/testkit/rls";

layer(PgTest)("New Slice RLS", (it) => {
  it.effect("blocks queries without context", () =>
    assertNoRowsWithoutContext(
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        return yield* sql`SELECT * FROM new_slice_table LIMIT 10`;
      })
    )
  );

  it.effect("returns data with context", () =>
    withTestTenant("test-org", Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE)`;
      strictEqual(result[0].current_setting, "test-org");
    }))
  );
});
```

## Connection Pooling Considerations

### Why SET (not SET LOCAL)

beep-effect uses session-level `SET` instead of transaction-scoped `SET LOCAL`:

| Approach | Scope | With Connection Pooling |
|----------|-------|-------------------------|
| `SET LOCAL` | Current transaction only | ❌ Fails - queries may use different connections |
| `SET` | Entire session/connection | ✅ Works - setting persists for connection lifetime |

**The Problem with SET LOCAL**:
1. Connection pool has multiple connections
2. `SET LOCAL` sets context on connection A
3. Next query may be routed to connection B
4. Connection B has no context → empty results

**The Solution**:
Session-level `SET` persists for the connection's lifetime, ensuring all queries on that connection see the context.

### SQL Injection Prevention

PostgreSQL's SET statement doesn't support parameterized queries:

```typescript
// WRONG - causes "syntax error at $1"
yield* sql`SET app.current_org_id = ${orgId}`;

// CORRECT - manual escaping
const escapeOrgId = (id: string) => id.replace(/'/g, "''");
yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);
```

## Testing

### Available Test Helpers

| Helper | Purpose |
|--------|---------|
| `withTestTenant(orgId, effect)` | Execute effect with tenant context |
| `setTestTenant(orgId)` | Set tenant context |
| `clearTestTenant()` | Clear tenant context |
| `assertNoRowsWithoutContext(query)` | Verify RLS blocks without context |
| `assertTenantIsolation(orgA, orgB, query)` | Verify cross-tenant isolation |
| `assertTenantIsolationForSession(orgA, orgB, query)` | For session table (uses `activeOrganizationId`) |

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

**Solution**: Use `sql.unsafe()` with manual escaping (this is handled internally by TenantContext)

### "Context not persisting between queries"

**Cause**: Using `SET LOCAL` instead of `SET`

**Solution**: The TenantContext service uses session-level `SET`. If implementing custom context, avoid `SET LOCAL`.

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
```

---

#### Task 2: Update AGENTS.md Files

Update the following AGENTS.md files:

**packages/shared/server/AGENTS.md** - Add TenantContext section:

```markdown
### TenantContext

The `TenantContext` service manages PostgreSQL session variables for RLS:

```typescript
import { TenantContext } from "@beep/shared-server";

const effect = Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;
  yield* ctx.setOrganizationId("org-123");
  // Subsequent queries scoped to org-123
});
```

**Methods**:
- `setOrganizationId(orgId)` - Set tenant context
- `clearContext()` - Clear tenant context
- `withOrganization(orgId, effect)` - Execute effect with context

**Critical**: Uses session-level `SET` (not `SET LOCAL`) due to connection pooling.

See `documentation/patterns/rls-patterns.md` for comprehensive RLS documentation.
```

**tooling/testkit/AGENTS.md** - Add RLS helpers section:

```markdown
### RLS Test Helpers

The `@beep/testkit/rls` module provides helpers for testing RLS:

```typescript
import { withTestTenant, assertNoRowsWithoutContext } from "@beep/testkit/rls";

it.effect("enforces isolation", () =>
  withTestTenant("org-a", Effect.gen(function* () {
    // Queries scoped to org-a
  }))
);
```

**Helpers**:
- `withTestTenant(orgId, effect)` - Execute with context
- `setTestTenant(orgId)` - Set context
- `clearTestTenant()` - Clear context
- `assertNoRowsWithoutContext(query)` - Verify RLS blocks
- `assertTenantIsolation(orgA, orgB, query)` - Verify isolation

See `documentation/patterns/rls-patterns.md` for comprehensive RLS patterns.
```

---

#### Task 3: Update Phase Statuses

Update `specs/rls-implementation/README.md` phase table:
- Phase 3: Change to COMPLETE
- Phase 4: Change to IN PROGRESS

Update `specs/rls-implementation/QUICK_START.md` phase table similarly.

---

#### Task 4: Update REFLECTION_LOG.md

After completing documentation:
1. Add Phase 4 section
2. Document what worked
3. Document what could be improved
4. Add any new learnings

---

### Verification Checklist

Before completing Phase 4:
- [ ] `documentation/patterns/rls-patterns.md` created
- [ ] All sections covered (Overview, Architecture, Adding RLS, TenantContext, Connection Pooling, Testing, Troubleshooting)
- [ ] `packages/shared/server/AGENTS.md` updated with TenantContext
- [ ] `tooling/testkit/AGENTS.md` updated with RLS helpers
- [ ] README.md phase statuses updated
- [ ] QUICK_START.md phase statuses updated
- [ ] REFLECTION_LOG.md updated with Phase 4 learnings
- [ ] Documentation reviewed for accuracy

---

### Critical Documentation Points

Ensure documentation covers these critical learnings:

1. **SET vs SET LOCAL**: Explain why session-level SET is used with connection pooling
2. **SQL Injection**: Document the escaping pattern for SET statements
3. **Session Table**: Note that `shared_session` uses `active_organization_id`
4. **Test Helpers**: Document all available helpers with examples
5. **Troubleshooting**: Include common errors and solutions

---

### Handoff Document

Full context in: `specs/rls-implementation/handoffs/HANDOFF_P4.md`
