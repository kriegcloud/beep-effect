# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing **Phase 1: Design & Type Planning** of the OrgTable Auto-RLS spec.

### Goal

Finalize the API design for `OrgTable.make` with RLS options and validate type preservation.

### Your Mission

Execute these design tasks:

**Task 1.1**: Define Type Signature
- Add `RlsOptions` type with `rlsPolicy` field
- Update `make()` to accept optional second parameter
- Ensure backward compatibility

**Task 1.2**: Design Policy Generators
- Create `standardPolicy(tableName)` function
- Create `nullablePolicy(tableName)` function
- Use SQL patterns from P0 research

**Task 1.3**: Design extraConfig Wrapper
- Merge user's extraConfig with auto-generated policies
- Handle edge cases (undefined extraConfig, empty return)
- Document approach in design-decisions.md

**Task 1.4**: Validate Types
- Check `.enableRLS()` return compatibility
- Verify generic flow through curried functions
- Test with existing table definitions

### Reference Implementation

```typescript
// New signature
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: RlsOptions
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)

type RlsOptions = {
  rlsPolicy?: 'standard' | 'nullable' | 'none';
}
```

### Reference Files

- `specs/orgtable-auto-rls/outputs/drizzle-api-analysis.md` - P0 research
- `specs/orgtable-auto-rls/templates/policy.template.ts` - Policy templates
- `packages/shared/tables/src/org-table/OrgTable.ts` - Target file

### Deliverables

1. Create `specs/orgtable-auto-rls/outputs/design-decisions.md`
2. Update `specs/orgtable-auto-rls/REFLECTION_LOG.md` with P1 learnings
3. Create `specs/orgtable-auto-rls/handoffs/HANDOFF_P2.md`
4. Create `specs/orgtable-auto-rls/handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `RlsOptions` type defined
- [ ] Updated signature is backward compatible
- [ ] extraConfig merging strategy documented
- [ ] Type preservation validated
- [ ] `outputs/design-decisions.md` created

### Verification

```bash
bun run check --filter @beep/shared-tables
```

### Handoff Document

Read full context in: `specs/orgtable-auto-rls/handoffs/HANDOFF_P1.md`
