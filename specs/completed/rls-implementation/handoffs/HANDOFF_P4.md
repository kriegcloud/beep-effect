# Handoff: Phase 4 - Documentation

> Context document for implementing Phase 4 of RLS Implementation.

**Created**: 2026-01-18
**From Phase**: P3 - Testing & Integration (COMPLETE)
**Target Phase**: P4 - Documentation
**Estimated Sessions**: 1

---

## Phase 3 Summary

### Completed Tasks

1. **Created RLS Test Helpers**
   - Location: `tooling/testkit/src/rls/`
   - Helpers: `withTestTenant`, `setTestTenant`, `clearTestTenant`, `assertNoRowsWithoutContext`, `assertTenantIsolation`, `assertTenantIsolationForSession`
   - TenantContextTag for test Layer composition

2. **Wrote Integration Tests**
   - Location: `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts`
   - 11 tests covering all RLS scenarios
   - All tests passing

3. **Fixed TenantContext Service**
   - Changed from `SET LOCAL` to `SET` (session-level)
   - Added SQL injection protection
   - Used `sql.unsafe()` for raw SQL

### Test Results

| Check | Status |
|-------|--------|
| All RLS tests | ✅ 11 pass, 0 fail |
| Total db-admin tests | ✅ 35 pass, 0 fail |
| `bun run check` | ✅ Passing |

### Critical Learnings from Phase 3

1. **SET vs SET LOCAL**
   - `SET LOCAL` only persists within the current transaction
   - Connection pooling routes sequential queries to different connections
   - Solution: Use session-level `SET` instead

2. **Parameterized Queries in SET**
   - PostgreSQL SET statement doesn't support parameterized queries ($1, $2)
   - Error: `syntax error at or near "$1"`
   - Solution: Use `sql.unsafe()` with manual quote escaping

3. **SQL Injection Prevention**
   - Use `escapeOrgId` function: `(id: string) => id.replace(/'/g, "''")`
   - Double single quotes to escape in SQL strings

---

## Phase 4 Objectives

### 1. Create RLS Pattern Documentation

Create `documentation/patterns/rls-patterns.md` covering:

- **Overview**: What RLS provides and why it matters
- **Architecture**: Session variable pattern with PostgreSQL
- **Adding RLS to New Slices**: Step-by-step guide
- **TenantContext Service**: Usage patterns and Layer composition
- **Connection Pooling**: SET vs SET LOCAL explanation
- **Testing**: How to use `@beep/testkit` RLS helpers
- **Troubleshooting**: Common errors and solutions

### 2. Update AGENTS.md Files

Update relevant AGENTS.md files with RLS guidance:

| Package | Updates Needed |
|---------|----------------|
| `packages/shared/server/AGENTS.md` | TenantContext service documentation |
| `packages/shared/tables/AGENTS.md` | OrgTable RLS relationship |
| `packages/_internal/db-admin/AGENTS.md` | RLS migration patterns |
| `tooling/testkit/AGENTS.md` | RLS test helper documentation |

### 3. Update Package READMEs

Ensure package-level documentation reflects RLS:

| Package | Changes |
|---------|---------|
| `@beep/shared-server` | Export TenantContext, document usage |
| `@beep/testkit` | Export RLS helpers, document patterns |

### 4. Create Troubleshooting Guide

Common issues and solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| Empty result set | No tenant context set | Call `setOrganizationId` before query |
| `syntax error at $1` | Parameterized SET | Use `sql.unsafe()` with escaping |
| Context not persisting | SET LOCAL with pooling | Use session-level SET |
| Cross-tenant data visible | RLS policy missing | Verify `pg_policies` has table entry |

---

## Files to Create

| File | Purpose |
|------|---------|
| `documentation/patterns/rls-patterns.md` | Main RLS pattern documentation |

## Files to Modify

| File | Purpose |
|------|---------|
| `packages/shared/server/AGENTS.md` | Add TenantContext section |
| `packages/shared/tables/AGENTS.md` | Add RLS relationship |
| `packages/_internal/db-admin/AGENTS.md` | Add RLS migration section |
| `tooling/testkit/AGENTS.md` | Add RLS test helpers section |
| `specs/rls-implementation/README.md` | Update phase statuses |
| `specs/rls-implementation/QUICK_START.md` | Update phase statuses |

---

## Documentation Templates

### RLS Patterns Documentation Structure

```markdown
# Row-Level Security Patterns

## Overview
- What RLS provides
- Multi-tenant isolation guarantees
- Defense-in-depth with application logic

## Architecture
- Session variable pattern (`app.current_org_id`)
- Policy structure and naming
- Admin bypass role

## Adding RLS to a New Slice

### Step 1: Identify Org-Scoped Tables
Tables using `OrgTable.make()` or with manual `organizationId`

### Step 2: Create Migration
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_{table} ON {table}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### Step 3: Add Index (if missing)
```sql
CREATE INDEX IF NOT EXISTS {table}_organization_id_rls_idx ON {table} (organization_id);
```

### Step 4: Test with RLS Helpers
```typescript
import { withTestTenant, assertNoRowsWithoutContext } from "@beep/testkit/rls";
```

## TenantContext Service

### Basic Usage
```typescript
import { TenantContext } from "@beep/shared-server";

const myEffect = Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;
  yield* ctx.setOrganizationId("org-123");
  // Subsequent queries scoped to org-123
});
```

### With Organization Scope
```typescript
const result = yield* ctx.withOrganization("org-123",
  repo.findAll()
);
```

## Connection Pooling Considerations

### Why SET (not SET LOCAL)
- SET LOCAL only persists within transaction
- Connection pooling routes queries to different connections
- Session-level SET persists for connection lifetime

### SQL Injection Prevention
SET doesn't support parameterized queries, so manual escaping is required:
```typescript
const escapeOrgId = (id: string) => id.replace(/'/g, "''");
yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);
```

## Testing

### Test Helpers Available
- `withTestTenant(orgId, effect)` - Execute effect with tenant context
- `setTestTenant(orgId)` - Set tenant context
- `clearTestTenant()` - Clear tenant context
- `assertNoRowsWithoutContext(query)` - Verify RLS blocks without context
- `assertTenantIsolation(orgA, orgB, query)` - Verify cross-tenant isolation

### Example Integration Test
```typescript
import { layer, strictEqual } from "@beep/testkit";
import { withTestTenant } from "@beep/testkit/rls";

layer(PgTest)("RLS Tests", (it) => {
  it.effect("enforces tenant isolation", () =>
    withTestTenant("org-a", Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const result = yield* sql`SELECT * FROM iam_member`;
      // All results should belong to org-a
    }))
  );
});
```

## Troubleshooting

### "Empty result set when expecting data"
**Cause**: Tenant context not set
**Solution**: Call `setOrganizationId` before queries

### "syntax error at or near $1"
**Cause**: SET doesn't support parameterized queries
**Solution**: Use `sql.unsafe()` with manual escaping

### "Context not persisting between queries"
**Cause**: Using SET LOCAL with connection pooling
**Solution**: Use session-level SET
```

---

## Verification Steps

After Phase 4:
- [ ] `documentation/patterns/rls-patterns.md` created and comprehensive
- [ ] `packages/shared/server/AGENTS.md` updated with TenantContext
- [ ] `packages/shared/tables/AGENTS.md` updated with RLS relationship
- [ ] `packages/_internal/db-admin/AGENTS.md` updated with RLS migrations
- [ ] `tooling/testkit/AGENTS.md` updated with RLS helpers
- [ ] README.md phase statuses updated
- [ ] QUICK_START.md phase statuses updated
- [ ] Documentation reviewed for accuracy
- [ ] Update REFLECTION_LOG.md

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/rls-implementation/handoffs/HANDOFF_P3.md` | Phase 3 context |
| `packages/shared/server/src/TenantContext/TenantContext.ts` | TenantContext implementation |
| `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql` | RLS migration |
| `tooling/testkit/src/rls/helpers.ts` | RLS test helpers |
| `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts` | Integration tests |
