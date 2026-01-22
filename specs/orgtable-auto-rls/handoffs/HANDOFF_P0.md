# Handoff: Phase 0 - Research & API Analysis

> Context document for Phase 0 of OrgTable automatic RLS implementation.

---

## Phase Objective

Understand Drizzle's RLS API, policy merging behavior, and type implications before modifying the `OrgTable.make` factory.

---

## Background Context

### What We're Building

The `OrgTable.make()` factory in `@beep/shared-tables` creates organization-scoped tables with a foreign key to `organization.id`. Currently, RLS policies are manually defined in each table's `extraConfig`. This spec automates RLS policy generation.

### Why This Matters

- **Consistency**: All org-scoped tables automatically get tenant isolation
- **Less boilerplate**: No need to repeat policy definitions
- **Semantic clarity**: `OrgTable` = tenant-isolated by contract

### Design Decision from Prior Discussion

User confirmed preference for options parameter approach:
```typescript
OrgTable.make(entityId, { rlsPolicy: 'standard' | 'nullable' | 'none' })
```

Default: `'standard'` (auto-generate RLS)

---

## Current Implementation Analysis

### OrgTable.make Signature (Current)

```typescript
// packages/shared/tables/src/org-table/OrgTable.ts
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)
```

### Manual RLS Pattern (Current)

```typescript
// packages/iam/tables/src/tables/member.table.ts
export const member = OrgTable.make(IamEntityIds.MemberId)(
  { ... },
  (t) => [
    pg.index("member_organization_id_idx").on(t.organizationId),
    pg.pgPolicy("tenant_isolation_iam_member", {
      as: "permissive",
      for: "all",
      using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
      withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    }),
  ]
).enableRLS();
```

---

## Research Questions

### Q1: OrgTable Factory Internals

1. How does `extraConfig` callback get passed to `pg.pgTable()`?
2. What is the return type of `extraConfig` callback?
3. Can we inject additional items into the extraConfig return array?
4. Does order of items in extraConfig array matter?

### Q2: Drizzle pgPolicy API

1. What is the exact `pgPolicy()` function signature?
2. How does `.enableRLS()` interact with `pgPolicy` definitions?
3. Does Drizzle Kit properly migrate `pgPolicy` definitions?
4. What happens with duplicate policy names?

### Q3: Type Preservation

1. Will adding a second parameter to outer function break type inference?
2. Is `PgTableWithMergedColumns` compatible with `.enableRLS()` return?
3. How do generics flow through the curried function?

---

## Key Files to Analyze

| File | Why |
|------|-----|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Target modification file |
| `packages/shared/tables/src/table/Table.ts` | Base factory pattern reference |
| `packages/shared/tables/src/table/types.ts` | Type definitions |
| `packages/iam/tables/src/tables/member.table.ts` | Manual RLS example |
| `specs/rls-implementation/outputs/drizzle-research.md` | Prior RLS API research |

---

## Expected Outputs

### From Task 0.1 (codebase-researcher)
- OrgTable.make implementation details
- extraConfig handling mechanics
- Type flow documentation

### From Task 0.2 (mcp-researcher)
- Drizzle pgPolicy API reference
- enableRLS() behavior
- Migration generation confirmation

### From Task 0.3 (codebase-researcher)
- Inventory of existing manual RLS policies
- Variations in policy patterns
- Tables needing 'nullable' variant

### Deliverable
- `outputs/drizzle-api-analysis.md` synthesizing all findings

---

## Success Criteria for Phase 0

- [ ] OrgTable.make signature and type flow understood
- [ ] Drizzle pgPolicy API documented
- [ ] Existing manual RLS patterns inventoried
- [ ] extraConfig merging strategy determined
- [ ] Type preservation approach validated
- [ ] `outputs/drizzle-api-analysis.md` created
- [ ] `REFLECTION_LOG.md` updated with learnings

---

## Verification Commands

```bash
# Verify current implementation compiles
bun run check --filter @beep/shared-tables

# Find existing pgPolicy usage
grep -r "pgPolicy" packages/*/tables/src/tables/*.ts

# Find enableRLS usage
grep -r "enableRLS" packages/*/tables/src/tables/*.ts
```

---

## Next Phase Preview

**Phase 1: Design & Type Planning** will:
- Finalize the options parameter signature
- Define policy SQL templates
- Validate type preservation
- Create `outputs/design-decisions.md`

---

## Reference Documents

- [README.md](../README.md) - Spec overview
- [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md) - Phase details
- [drizzle-research.md](../../rls-implementation/outputs/drizzle-research.md) - Prior RLS research
- [shared-tables CLAUDE.md](../../../packages/shared/tables/CLAUDE.md) - Package guidelines
