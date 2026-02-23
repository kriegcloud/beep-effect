# Handoff: Phase 3 - Cleanup & Verification

> Context document for Phase 3 of OrgTable automatic RLS implementation.

---

## Phase Objective

Remove the manual RLS policy from `member.table.ts` to resolve the duplicate policy conflict, then verify migration generation works correctly.

---

## Context from Phase 2

### Migration Generation Failure

Running `bun run db:generate` fails with:
```
ReferenceError: Cannot access 'tableKey2' before initialization
    at generatePgSnapshot (/node_modules/drizzle-kit/bin.cjs:18926:19)
```

This is a drizzle-kit bug triggered by duplicate policy definitions in the schema.

### Root Cause: Triple Policy Definition

The `tenant_isolation_iam_member` policy is defined in three places:

| Source | Location | Status |
|--------|----------|--------|
| Manual migration | `drizzle/0001_enable_rls_policies.sql:21-24` | Already in database |
| Manual schema code | `member.table.ts:64-70` | **REMOVE THIS** |
| Auto-generated | `OrgTable.make` implementation | Keep (new default) |

### Only One Table Affected

The `member` table is the **only** OrgTable-based table with manual RLS. All other tables will receive auto-generated policies cleanly.

---

## Phase 3 Tasks

### Task 3.1: Remove Manual Policy from member.table.ts

**File**: `packages/iam/tables/src/tables/member.table.ts`

**Remove lines 64-70** (the pgPolicy call in extraConfig):
```typescript
    // RLS Policy for multi-tenant isolation  <-- REMOVE
    // Uses PostgreSQL session variable...    <-- REMOVE
    pg.pgPolicy("tenant_isolation_iam_member", {  <-- REMOVE
      as: "permissive",                           <-- REMOVE
      for: "all",                                 <-- REMOVE
      using: sql`organization_id = ...`,          <-- REMOVE
      withCheck: sql`organization_id = ...`,      <-- REMOVE
    }),                                           <-- REMOVE
```

### Task 3.2: Remove Manual .enableRLS() Call

**Same file**: `packages/iam/tables/src/tables/member.table.ts`

**Remove line 71** (the `.enableRLS()` chained call):
```typescript
).enableRLS();  <-- REMOVE, leave just );
```

The `OrgTable.make` implementation now calls `.enableRLS()` automatically.

### Task 3.3: Verify Type Checks

```bash
bun run check --filter @beep/iam-tables
bun run check --filter @beep/shared-tables
```

### Task 3.4: Test Migration Generation

```bash
bun run db:generate
```

**Expected outcome**: Either:
- Empty migration (no schema changes - policies already exist in DB)
- Minimal migration with only new tables (knowledge slice from `0002_sparkling_moondragon.sql`)

### Task 3.5: Verify No Duplicate Policies

After successful `db:generate`, inspect output for any policy-related SQL. There should be:
- NO `CREATE POLICY tenant_isolation_iam_member` (already exists)
- Possibly new policies for other tables if they were added since last migration

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/iam/tables/src/tables/member.table.ts` | **MODIFY**: Remove manual RLS |
| `packages/shared/tables/src/org-table/OrgTable.ts` | Reference: Auto-RLS implementation |
| `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql` | Reference: Existing RLS migration |

---

## Success Criteria

- [ ] Manual `pgPolicy()` call removed from `member.table.ts`
- [ ] Manual `.enableRLS()` call removed from `member.table.ts`
- [ ] `bun run check --filter @beep/iam-tables` passes
- [ ] `bun run db:generate` completes without error
- [ ] No duplicate policy creation in generated migration
- [ ] `REFLECTION_LOG.md` updated with P3 learnings

---

## Expected Code Change

**Before** (`member.table.ts`):
```typescript
export const member = OrgTable.make(IamEntityIds.MemberId)(
  {
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>().notNull(),
    role: memberRoleEnum("role").notNull().default(Member.MemberRoleEnum.member),
    // ... other columns
  },
  (t) => [
    // ... indexes
    pg.pgPolicy("tenant_isolation_iam_member", {
      as: "permissive",
      for: "all",
      using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
      withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    }),
  ]
).enableRLS();
```

**After** (`member.table.ts`):
```typescript
export const member = OrgTable.make(IamEntityIds.MemberId)(
  {
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>().notNull(),
    role: memberRoleEnum("role").notNull().default(Member.MemberRoleEnum.member),
    // ... other columns
  },
  (t) => [
    // ... indexes (keep all pg.index() calls)
    // REMOVED: pg.pgPolicy("tenant_isolation_iam_member", {...})
  ]
);  // REMOVED: .enableRLS()
```

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/iam-tables

# Generate migrations
bun run db:generate

# View latest migration (if any)
ls -la packages/_internal/db-admin/drizzle/

# Full build verification
bun run build --filter @beep/iam-tables
```

---

## Notes for Phase 4

Phase 4 (Documentation) will:
1. Update `@beep/shared-tables` AGENTS.md with auto-RLS documentation
2. Add usage examples for `rlsPolicy` option
3. Document the migration from manual to automatic RLS

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Removing policy breaks tenant isolation | Policy already exists in DB via migration `0001` |
| Type errors after removal | `OrgTable.make` return type handles `.enableRLS()` automatically |
| Other tables affected | Only `member` has manual RLS - verified via grep |
