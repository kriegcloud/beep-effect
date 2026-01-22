# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing **Phase 0: Research & API Analysis** of the OrgTable Auto-RLS spec.

### Goal

Research Drizzle's RLS API, OrgTable factory internals, and existing policy patterns before modifying the factory to auto-generate RLS.

### Your Mission

Execute these three research tasks in sequence:

**Task 0.1**: Analyze OrgTable Factory
- Read `packages/shared/tables/src/org-table/OrgTable.ts`
- Document how `extraConfig` callback is processed
- Trace type flow from custom columns to final table
- Note constraints on extraConfig return value

**Task 0.2**: Research Drizzle pgPolicy API
- Use mcp-researcher agent for Drizzle RLS documentation
- Document `pgPolicy()` signature and options
- Confirm `.enableRLS()` interaction with policies
- Verify Drizzle Kit migration generation

**Task 0.3**: Inventory Existing Manual RLS
- Search `packages/*/tables/src/tables/*.ts` for `pgPolicy` usage
- Document exact SQL expressions used
- Identify tables needing 'nullable' variant (optional organizationId)
- List tables that will need cleanup in Phase 3

### Critical Patterns

**OrgTable.make current signature**:
```typescript
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)
```

**Proposed API change**:
```typescript
OrgTable.make(entityId, { rlsPolicy: 'standard' | 'nullable' | 'none' })
```

**Policy SQL pattern**:
```sql
organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
```

### Reference Files

- `packages/shared/tables/src/org-table/OrgTable.ts` - Target file
- `packages/shared/tables/src/table/types.ts` - Type definitions
- `packages/iam/tables/src/tables/member.table.ts` - Manual RLS example
- `specs/rls-implementation/outputs/drizzle-research.md` - Prior research

### Verification

After research:
```bash
bun run check --filter @beep/shared-tables
```

### Deliverables

1. Create `specs/orgtable-auto-rls/outputs/drizzle-api-analysis.md` with:
   - OrgTable.make implementation analysis
   - Drizzle pgPolicy API reference
   - Existing policy inventory
   - Recommended implementation approach

2. Update `specs/orgtable-auto-rls/REFLECTION_LOG.md` with Phase 0 learnings

3. Create `specs/orgtable-auto-rls/handoffs/HANDOFF_P1.md` for next phase

4. Create `specs/orgtable-auto-rls/handoffs/P1_ORCHESTRATOR_PROMPT.md` for next phase

### Success Criteria

- [ ] OrgTable.make signature and type flow documented
- [ ] Drizzle pgPolicy API understood
- [ ] Existing manual RLS patterns inventoried
- [ ] extraConfig merging strategy determined
- [ ] `outputs/drizzle-api-analysis.md` created
- [ ] Handoff documents for P1 created

### Handoff Document

Read full context in: `specs/orgtable-auto-rls/handoffs/HANDOFF_P0.md`
