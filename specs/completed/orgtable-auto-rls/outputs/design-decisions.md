# OrgTable Auto-RLS Design Decisions

> Phase 1 output document capturing API design, type decisions, and implementation strategy.

**Created**: 2026-01-21
**Status**: APPROVED FOR IMPLEMENTATION

---

## 1. Type Signature Design

### RlsOptions Type

```typescript
/**
 * RLS options for OrgTable.make
 */
export type RlsOptions = {
  /**
   * Controls automatic RLS policy generation.
   *
   * - 'standard' (default): Generates policy requiring exact organizationId match
   * - 'nullable': Generates policy allowing NULL or matching organizationId
   * - 'none': Skips automatic policy generation (for custom policies)
   */
  readonly rlsPolicy?: "standard" | "nullable" | "none";
};
```

### Updated make() Signature

```typescript
// NEW SIGNATURE
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: RlsOptions  // NEW: Optional second parameter
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)
```

### Backward Compatibility

- `options` parameter is **optional** with no required fields
- Existing calls `OrgTable.make(entityId)` work unchanged
- Default behavior: `rlsPolicy: 'standard'` (security by default)

---

## 2. Policy Generator Functions

### standardPolicy

```typescript
/**
 * Standard tenant isolation policy for NOT NULL organizationId columns.
 * Requires exact match between row's organizationId and session context.
 */
const standardPolicy = (tableName: string) =>
  pg.pgPolicy(`tenant_isolation_${tableName}`, {
    as: "permissive",
    for: "all",
    using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  });
```

### nullablePolicy

```typescript
/**
 * Nullable tenant isolation policy for OPTIONAL organizationId columns.
 * Allows access when organizationId is NULL OR matches session context.
 */
const nullablePolicy = (tableName: string) =>
  pg.pgPolicy(`tenant_isolation_${tableName}`, {
    as: "permissive",
    for: "all",
    using: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    withCheck: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  });
```

### Policy Naming Convention

- Format: `tenant_isolation_${entityId.tableName}`
- Examples:
  - `tenant_isolation_iam_member`
  - `tenant_isolation_document`
  - `tenant_isolation_file`

---

## 3. extraConfig Wrapper Strategy

### Merging Approach

When user provides `extraConfig`, we wrap it to append auto-generated policies:

```typescript
const mergedConfig = (self: OrgExtraConfigColumns<TableName, Brand, TColumnsMap>) => {
  // 1. Call user's extraConfig if provided
  const userConfigs = extraConfig?.(self) ?? [];

  // 2. Generate policy based on options (skip if 'none')
  if (rlsPolicy === "none") {
    return userConfigs;
  }

  const policy = rlsPolicy === "nullable"
    ? nullablePolicy(entityId.tableName)
    : standardPolicy(entityId.tableName);

  // 3. Append auto-generated policy to user's configs
  return [...userConfigs, policy];
};
```

### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| `extraConfig: undefined` | Auto-policy only |
| `extraConfig: (t) => []` | Auto-policy only |
| `extraConfig: (t) => [userIndex]` | User index + auto-policy |
| `rlsPolicy: 'none'` | User configs only (no auto-policy) |

### Type Preservation

The wrapper function preserves the `self` parameter type:
- `self: OrgExtraConfigColumns<TableName, Brand, TColumnsMap>`
- User's extraConfig callback receives correctly-typed table reference
- IDE autocomplete works for `t.columnName` in user callbacks

---

## 4. Return Type Analysis

### enableRLS() Impact

Drizzle's `.enableRLS()` method returns:
```typescript
Omit<PgTableWithColumns<T>, 'enableRLS'>
```

This means:
1. Table structure is identical (all columns, indices, policies)
2. Only the `enableRLS` method is removed from the return type
3. Prevents calling `.enableRLS()` twice (compile-time guard)

### Current vs New Return Types

| Scenario | Return Type |
|----------|-------------|
| Current (no RLS) | `PgTableWithMergedColumns<...>` (has `enableRLS` method) |
| `rlsPolicy: 'none'` | `PgTableWithMergedColumns<...>` (has `enableRLS` method) |
| `rlsPolicy: 'standard'` | `Omit<PgTableWithMergedColumns<...>, 'enableRLS'>` |
| `rlsPolicy: 'nullable'` | `Omit<PgTableWithMergedColumns<...>, 'enableRLS'>` |

### Breaking Change Assessment

**Impact**: Low

Consumers rarely call `.enableRLS()` after table creation. The only known usage is `member.table.ts` which currently calls it manually and will be migrated.

**Decision**: Accept the type narrowing. When `rlsPolicy !== 'none'`, the returned table lacks the `enableRLS` method - this is intentional (prevents double-enable).

---

## 5. Implementation Strategy

### Phase 2 Implementation Order

1. Add `RlsOptions` type to module scope
2. Update `make()` outer function to accept `options` parameter
3. Add policy generator functions (internal, not exported)
4. Modify `maker` function:
   - Create `mergedConfig` wrapper
   - Pass wrapper to `pg.pgTable()`
   - Call `.enableRLS()` conditionally
5. Update return type to reflect `enableRLS()` call

### Verification Steps

```bash
# 1. Type check the package
bun run check --filter @beep/shared-tables

# 2. Type check dependent packages
bun run check --filter @beep/iam-tables
bun run check --filter @beep/documents-tables

# 3. Full workspace check
bun run check
```

---

## 6. Open Decisions (Deferred to Later Phases)

### Policy Naming Conflicts

**Question**: What if user defines a custom policy with the same name as auto-generated?

**Recommendation**: Not addressed in Phase 1. In Phase 3, add detection logic that:
1. Checks if user's extraConfig returns a policy with conflicting name
2. Logs warning and skips auto-generation if conflict detected

### Migration Path for Existing Tables

**Question**: How do existing tables (like `member`) transition?

**Plan** (Phase 4):
1. Remove manual `pgPolicy()` calls from extraConfig
2. Remove manual `.enableRLS()` calls
3. Let auto-generation handle both
4. Run `db:generate` to verify no migration changes (policy already exists)

---

## 7. API Examples (Post-Implementation)

### Standard Usage (Default)

```typescript
// Most tables - auto RLS with standard policy
export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  {
    title: pg.text("title").notNull(),
  },
  (t) => [
    pg.index("document_title_idx").on(t.title),
  ]
);
// Result: tenant_isolation_document policy + .enableRLS()
```

### Explicit Standard

```typescript
// Explicit opt-in (same as default)
export const document = OrgTable.make(SharedEntityIds.DocumentId, {
  rlsPolicy: 'standard'
})(...);
```

### Nullable Policy

```typescript
// For tables where organizationId can be NULL
export const sharedResource = OrgTable.make(SharedEntityIds.SharedResourceId, {
  rlsPolicy: 'nullable'
})(...);
// Result: Policy allowing NULL OR matching orgId
```

### Opt-Out (Custom Policy)

```typescript
// Skip auto-generation, use custom policy
export const specialTable = OrgTable.make(EntityIds.SpecialId, {
  rlsPolicy: 'none'
})(
  { data: pg.text("data") },
  (t) => [
    pg.pgPolicy("custom_policy", {
      as: "permissive",
      for: "select",
      using: sql`custom_condition`,
    }),
  ]
).enableRLS();  // Must call manually when rlsPolicy: 'none'
```

---

## References

- P0 Research: `specs/orgtable-auto-rls/outputs/drizzle-api-analysis.md`
- Policy Templates: `specs/orgtable-auto-rls/templates/policy.template.ts`
- Current Implementation: `packages/shared/tables/src/org-table/OrgTable.ts`
- Manual RLS Example: `packages/iam/tables/src/tables/member.table.ts`
