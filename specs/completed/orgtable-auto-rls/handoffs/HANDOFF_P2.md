# Handoff: Phase 2 - Migration Testing & Validation

> Context document for Phase 2 of OrgTable automatic RLS implementation.

---

## Phase Objective

Validate that the auto-RLS implementation generates correct migrations and works correctly at runtime. This phase focuses on testing, not code changes.

---

## Context from Phase 1

### Implementation Complete

The `OrgTable.make` function has been modified to:

1. Accept optional `RlsOptions` parameter with `rlsPolicy` field
2. Default to `'standard'` RLS policy (security by default)
3. Merge auto-generated policies with user's extraConfig
4. Call `.enableRLS()` automatically (unless `rlsPolicy: 'none'`)

### Code Location

`packages/shared/tables/src/org-table/OrgTable.ts`

### Key Changes Summary

```typescript
// NEW: Options type
export type RlsOptions = {
  readonly rlsPolicy?: "standard" | "nullable" | "none";
};

// NEW: Signature with options parameter
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: RlsOptions  // NEW
): (...)

// INTERNAL: Policy generators
const standardPolicy = (tableName: string) => pg.pgPolicy(`tenant_isolation_${tableName}`, {...});
const nullablePolicy = (tableName: string) => pg.pgPolicy(`tenant_isolation_${tableName}`, {...});

// INTERNAL: Merged config wrapper + .enableRLS() call
```

### Verification Status

| Check | Status |
|-------|--------|
| `@beep/shared-tables` compiles | PASS |
| `@beep/iam-tables` compiles | PASS |
| `@beep/documents-tables` compiles | PASS |
| Backward compatible | PASS |

---

## Phase 2 Tasks

### Task 2.1: Migration Generation Test

Run `db:generate` and verify the migration SQL is correct:

```bash
bun run db:generate
```

**Expected output**:
- New migration file with `ENABLE ROW LEVEL SECURITY` statements
- Policy creation statements for each OrgTable-based table
- Policy naming: `tenant_isolation_${tableName}`

### Task 2.2: Manual Review of Generated SQL

Verify generated migration contains:

```sql
-- For each OrgTable-based table:
ALTER TABLE "table_name" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_table_name" ON "table_name"
  AS PERMISSIVE FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### Task 2.3: Conflict Detection (member table)

The `member` table already has manual RLS. Check for:

1. Duplicate policy name (`tenant_isolation_iam_member`)
2. How Drizzle handles the conflict

**Options**:
- If Drizzle detects existing policy and skips: Document behavior
- If Drizzle generates duplicate: Need Phase 3 cleanup

### Task 2.4: Integration Test

Create a simple test to verify RLS works:

1. Create test transaction
2. Set `app.current_org_id` session variable
3. Query an OrgTable
4. Verify only rows with matching organizationId are returned

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Implementation (complete) |
| `packages/_internal/db-admin/drizzle/` | Migration output directory |
| `packages/iam/tables/src/tables/member.table.ts` | Existing manual RLS (needs cleanup) |

---

## Success Criteria

- [ ] `db:generate` produces valid migration SQL
- [ ] Migration SQL contains correct RLS statements
- [ ] No policy naming conflicts OR conflicts documented
- [ ] Integration test demonstrates RLS enforcement
- [ ] `REFLECTION_LOG.md` updated with P2 learnings

---

## Verification Commands

```bash
# Generate migrations
bun run db:generate

# Review generated SQL
cat packages/_internal/db-admin/drizzle/<latest-migration>.sql

# Run integration tests (if available)
bun run test --filter @beep/shared-tables
```

---

## Notes for Phase 3

Phase 3 will:
1. Remove manual RLS from member.table.ts (lines 64-70)
2. Remove manual `.enableRLS()` call (line 71)
3. Verify no duplicate policies in migration
4. Run full test suite
