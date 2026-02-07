# Handoff: Phase 1 - Design & Type Planning

> Context document for Phase 1 of OrgTable automatic RLS implementation.

---

## Phase Objective

Finalize the API design for `OrgTable.make` options parameter and validate type preservation before implementation.

---

## Context from Phase 0

### Key Findings

1. **OrgTable.make internals**: `extraConfig` passed directly to `pg.pgTable()` at line 91
2. **Injection strategy**: Create wrapper function merging user config + auto policies
3. **Drizzle API**: `pgPolicy()` fully supported with migration generation in v0.40.3
4. **Inventory**: 1 table with manual RLS (member), ~25 tables using OrgTable.make

### Confirmed Design

```typescript
OrgTable.make(entityId, { rlsPolicy: 'standard' | 'nullable' | 'none' })
```

Default: `'standard'` (auto-generate RLS)

---

## Phase 1 Tasks

### Task 1.1: Type Signature Design
- Define `RlsOptions` type
- Update `make()` outer function signature
- Ensure backward compatibility (options optional)

### Task 1.2: Policy Generator Design
- `standardPolicy(tableName)` - NOT NULL orgId pattern
- `nullablePolicy(tableName)` - optional orgId pattern
- Policy naming: `tenant_isolation_${tableName}`

### Task 1.3: extraConfig Wrapper Design
- Merge user's extraConfig return with auto policies
- Handle undefined extraConfig case
- Preserve type inference for `self` parameter

### Task 1.4: Type Validation
- Test that `.enableRLS()` return type is compatible
- Verify generic flow through curried functions
- Check downstream usage patterns compile

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Implementation target |
| `specs/orgtable-auto-rls/templates/policy.template.ts` | Policy patterns |
| `specs/orgtable-auto-rls/outputs/drizzle-api-analysis.md` | P0 research |

---

## Success Criteria

- [ ] `RlsOptions` type defined
- [ ] Updated signature backward compatible
- [ ] extraConfig merging strategy documented
- [ ] Type preservation validated
- [ ] `outputs/design-decisions.md` created

---

## Verification

```bash
bun run check --filter @beep/shared-tables
```
