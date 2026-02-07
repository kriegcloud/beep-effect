# Drizzle RLS API Analysis

> Phase 0 research findings for OrgTable automatic RLS implementation.

**Generated**: 2026-01-21
**Status**: COMPLETE

---

## Executive Summary

This document synthesizes research on Drizzle's RLS API, the OrgTable factory internals, and existing manual RLS patterns. The goal is to inform the design of automatic RLS policy generation in `OrgTable.make`.

**Key Findings**:
1. OrgTable.make passes `extraConfig` directly to `pg.pgTable()` - we can intercept and merge policies
2. Drizzle's `pgPolicy()` API is well-documented with full migration support in v0.40.3
3. Only 1 table (member) has manual RLS - cleanup will be minimal
4. 3 tables use nullable organizationId pattern - requires 'nullable' variant

---

## 1. OrgTable.make Implementation Analysis

### Current Signature

```typescript
// packages/shared/tables/src/org-table/OrgTable.ts:55-60
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)
```

### Type Definitions

| Type | Purpose |
|------|---------|
| `OrgDefaultColumns<TableName, Brand>` | Adds `organizationId` to standard `DefaultColumns` |
| `NoOrgDefaultKeys<TColumnsMap>` | Prevents users from overriding default keys (compile-time error) |
| `OrgAllColumns<TableName, Brand, TColumnsMap>` | Merges defaults + custom columns with `Prettify` wrapper |
| `OrgExtraConfig<TableName, Brand, TColumnsMap>` | Callback type returning `PgTableExtraConfigValue[]` |

### extraConfig Flow

```typescript
// Line 91 - extraConfig passed directly to pg.pgTable()
return pg.pgTable<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>(
  entityId.tableName,
  cols,
  extraConfig  // <-- User's callback passed directly
);
```

**Critical Insight**: The factory doesn't intercept or modify `extraConfig`. To inject auto-generated policies, we must:
1. Accept optional RLS options in `make()` first parameter
2. Create a wrapper function that calls user's extraConfig AND appends our policies
3. Call `.enableRLS()` on the returned table

### Proposed Modification Strategy

```typescript
// New signature
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: { rlsPolicy?: 'standard' | 'nullable' | 'none' }
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)

// Implementation approach
const maker = (defaultColumns) => (columns, extraConfig) => {
  const cols = { ...defaultColumns, ...columns };

  // Merge user's extraConfig with auto-generated policies
  const mergedConfig = (self) => {
    const userConfig = extraConfig?.(self) ?? [];
    const autoPolicy = createPolicy(entityId.tableName, options?.rlsPolicy ?? 'standard');
    return [...userConfig, autoPolicy];
  };

  const table = pg.pgTable(entityId.tableName, cols, mergedConfig);

  // Always enable RLS unless explicitly disabled
  return (options?.rlsPolicy !== 'none') ? table.enableRLS() : table;
};
```

---

## 2. Drizzle pgPolicy API Reference

### Function Signature (v0.40.3)

```typescript
function pgPolicy<TName extends string>(
  name: TName,
  config?: PgPolicyConfig
): PgPolicy<TName>

interface PgPolicyConfig {
  as?: 'permissive' | 'restrictive';
  for?: 'all' | 'select' | 'insert' | 'update' | 'delete';
  to?: PgRole | PgRole[] | string | string[];
  using?: SQL;
  withCheck?: SQL;
}
```

### Parameter Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `as` | `'permissive' \| 'restrictive'` | `'permissive'` | Policy type (OR vs AND logic) |
| `for` | `'all' \| 'select' \| 'insert' \| 'update' \| 'delete'` | `'all'` | Command scope |
| `to` | `PgRole \| PgRole[] \| string \| string[]` | `'public'` | Target role(s) |
| `using` | `SQL` | Required for select/update/delete | Row visibility expression |
| `withCheck` | `SQL` | Required for insert/update | Row validation expression |

### enableRLS() Behavior

- **Required**: PostgreSQL ignores policies on tables without RLS enabled
- **Returns**: `this` (allows chaining)
- **Migration**: Generates `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`

### Migration Support

Confirmed working in Drizzle Kit:
- `drizzle-kit generate` - Includes RLS and policy DDL
- `drizzle-kit migrate` - Applies enable RLS and create policy statements
- `drizzle-kit introspect` - Detects existing RLS policies

---

## 3. Existing RLS Pattern Inventory

### Tables with Manual RLS

| Table | Package | Policy Name | Pattern |
|-------|---------|-------------|---------|
| `member` | `@beep/iam-tables` | `tenant_isolation_iam_member` | Standard (NOT NULL orgId) |

**Member Table Implementation**:
```typescript
// packages/iam/tables/src/tables/member.table.ts:64-71
pg.pgPolicy("tenant_isolation_iam_member", {
  as: "permissive",
  for: "all",
  using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
}),
// ...
).enableRLS();
```

### Tables Using OrgTable.make (Need Standard Policy)

| Package | Tables |
|---------|--------|
| `@beep/iam-tables` | `member`, `teamMember`, `apiKey`, `organizationRole`, `twoFactor`, `subscription` |
| `@beep/shared-tables` | `team`, `file`, `folder`, `uploadSession` |
| `@beep/documents-tables` | `document`, `documentVersion`, `comment`, `discussion`, `documentFile` |
| `@beep/comms-tables` | `emailTemplate` |
| `@beep/knowledge-tables` | `ontology`, `classDefinition`, `propertyDefinition`, `entity`, `entityCluster`, `sameAsLink`, `mention`, `extraction`, `relation`, `embedding` |

**Total**: ~25 tables using OrgTable.make

### Tables Using Table.make with Nullable organizationId

These use `Table.make` (not `OrgTable.make`) but have nullable `organizationId`:

| Package | Table | Notes |
|---------|-------|-------|
| `@beep/iam-tables` | `ssoProvider` | Nullable orgId for multi-tenant SSO |
| `@beep/iam-tables` | `scimProvider` | Nullable orgId for SCIM provisioning |
| `@beep/iam-tables` | `invitation` | Nullable orgId for pending invites |

**These will NOT be modified by OrgTable changes** - they use a different factory.

---

## 4. Policy SQL Patterns

### Standard Pattern (NOT NULL organizationId)

```sql
-- For tables where organizationId is always required
USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
```

**Why NULLIF?**: Prevents matching when session variable is empty string (fails open → blocks all).

### Nullable Pattern (OPTIONAL organizationId)

```sql
-- For tables where organizationId can be NULL
USING (
  organization_id IS NULL OR
  organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
)
WITH CHECK (
  organization_id IS NULL OR
  organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
)
```

**Use case**: Tables that can exist without organization scope initially.

---

## 5. Recommended Implementation Approach

### Phase 1 Design Decisions

1. **Options Position**: Add options as second parameter to outer function
   ```typescript
   OrgTable.make(entityId, { rlsPolicy: 'standard' })
   ```

2. **Default Behavior**: `rlsPolicy: 'standard'` (auto-generate, enable RLS)

3. **Policy Naming**: Use `tenant_isolation_${tableName}` format for consistency

4. **extraConfig Merging**: Append auto-policies to user's extraConfig return array

5. **enableRLS() Call**: Automatic unless `rlsPolicy: 'none'`

### Implementation Checklist

1. [ ] Add `RlsOptions` type to OrgTable module
2. [ ] Modify `make()` signature to accept options
3. [ ] Create policy generator functions (standard/nullable)
4. [ ] Implement extraConfig wrapper that merges user config + auto policies
5. [ ] Call `.enableRLS()` conditionally based on options
6. [ ] Update type exports if needed

### Migration Impact

When tables adopt auto-RLS:
- Tables with existing manual policies: Remove manual policy, keep indexes
- Tables without RLS: Will get new policies in next migration
- Potential duplicate policy names: Must coordinate cleanup

---

## 6. Open Questions for Phase 1

1. **Type Preservation**: Does adding options parameter break downstream type inference?
   - Test: Create proof-of-concept with modified signature

2. **Policy Naming Conflicts**: What if user defines custom policy with same name?
   - Recommendation: Detect and warn or skip auto-generation

3. **Backward Compatibility**: Should `undefined` options default to 'standard' or 'none'?
   - Recommendation: 'standard' (opt-out rather than opt-in for security)

4. **Return Type**: Does `.enableRLS()` change the table type in a breaking way?
   - Check: Type compatibility with existing usage patterns

---

## References

- [Drizzle RLS Documentation](https://orm.drizzle.team/docs/rls)
- [Drizzle Policy Documentation](https://orm.drizzle.team/docs/policy)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Prior research: `specs/rls-implementation/outputs/drizzle-research.md`
- Policy templates: `specs/orgtable-auto-rls/templates/policy.template.ts`
