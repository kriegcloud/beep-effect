# Handoff: Phase 4 - Documentation

> Context document for Phase 4 of OrgTable automatic RLS implementation.

---

## Phase Objective

Document the auto-RLS feature in relevant AGENTS.md files and ensure usage examples are clear.

---

## Context from Phase 3

### Completed Work

1. **OrgTable.make implementation** (`packages/shared/tables/src/org-table/OrgTable.ts`)
   - Added `RlsOptions` type with `rlsPolicy` parameter
   - Implemented `standardPolicy()` and `nullablePolicy()` generators
   - Auto-merges user extraConfig with generated policies
   - Automatically calls `.enableRLS()` unless `rlsPolicy: 'none'`

2. **Manual RLS removal** (`packages/iam/tables/src/tables/member.table.ts`)
   - Removed manual `pgPolicy("tenant_isolation_iam_member", {...})` call
   - Removed manual `.enableRLS()` call
   - Removed unused `sql` import

3. **Migration Reset** (Post-P3)
   - Regenerated migrations from scratch
   - `0000_far_sleepwalker.sql` - Auto-generated schema with 26 RLS policies
   - `0001_custom_rls_extensions.sql` - Custom migration for special cases
   - All 55 RLS integration tests pass

4. **Verification**
   - All type checks pass
   - `db:generate` succeeds
   - Build succeeds

### API Surface

```typescript
// RlsOptions type
export type RlsOptions = {
  readonly rlsPolicy?: "standard" | "nullable" | "none";
};

// Usage
export const make = <TableName, Brand>(
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: RlsOptions
) => // ...
```

### Policy Generation Behavior

| Option | Policy Generated | enableRLS Called |
|--------|-----------------|------------------|
| `undefined` (default) | `tenant_isolation_${tableName}` (standard) | Yes |
| `'standard'` | `tenant_isolation_${tableName}` (standard) | Yes |
| `'nullable'` | `tenant_isolation_${tableName}` (nullable) | Yes |
| `'none'` | None | No |

### Standard vs Nullable Policy

**Standard** (for NOT NULL organizationId):
```sql
USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
```

**Nullable** (for OPTIONAL organizationId):
```sql
USING (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
WITH CHECK (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
```

---

## Phase 4 Tasks

### Task 4.1: Update @beep/shared-tables AGENTS.md

**File**: `packages/shared/tables/AGENTS.md`

Add documentation covering:
1. **RlsOptions parameter** in OrgTable.make signature
2. **Policy option values** and their behavior
3. **Migration implications** for existing tables
4. **When to use `'none'`** (custom policies needed)

### Task 4.2: Update Quick Recipes

Add a recipe showing how to use the `rlsPolicy` option:

```typescript
// Standard (default) - most tables
export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  { title: pg.text("title").notNull() },
  (t) => [pg.index("doc_title_idx").on(t.title)]
);

// Nullable - for optional organization ownership
export const globalSetting = OrgTable.make(SharedEntityIds.GlobalSettingId, { rlsPolicy: "nullable" })(
  { key: pg.text("key").notNull() }
);

// None - for custom policies
export const auditLog = OrgTable.make(SharedEntityIds.AuditLogId, { rlsPolicy: "none" })(
  { action: pg.text("action").notNull() },
  (t) => [
    pg.pgPolicy("audit_log_admin_only", {
      using: sql`current_setting('app.is_admin', TRUE) = 'true'`,
    }),
  ]
);
```

### Task 4.3: Update Authoring Guardrails

Add to the Authoring Guardrails section:
- NEVER add manual `pgPolicy()` for tenant isolation - use `OrgTable.make` defaults
- NEVER add manual `.enableRLS()` - `OrgTable.make` handles this automatically
- Use `rlsPolicy: 'none'` ONLY when custom policies are required (e.g., admin-only access)

### Task 4.4: Update Gotchas Section

Add gotchas about:
- **Auto-RLS migration conflict**: When enabling auto-RLS on tables that already have manual policies in migrations, duplicate policy errors occur. Either remove manual policies from code or edit migrations.
- **Session table exception**: `shared_session` uses `active_organization_id` and requires custom RLS in `0001_custom_rls_extensions.sql`.
- **Custom migration maintenance**: Tables using `Table.make` with organizationId need manual RLS in custom migrations.

### Task 4.5: Document Session Table Exception

Add a dedicated section explaining why `shared_session` cannot use `OrgTable.make`:
- Uses `active_organization_id` column (user's current context, not ownership)
- RLS policy defined in custom migration
- Pattern for other tables needing non-standard RLS columns

### Task 4.6: Update Key Files Reference

Update references to reflect current migration structure:
- `0000_far_sleepwalker.sql` - Auto-generated schema + 26 RLS policies
- `0001_custom_rls_extensions.sql` - Session, invitation, SSO/SCIM, admin role

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/shared/tables/AGENTS.md` | **MODIFY**: Add auto-RLS documentation |
| `packages/shared/tables/src/org-table/OrgTable.ts` | Reference: Implementation details |
| `packages/iam/tables/AGENTS.md` | **REVIEW**: Update if needed for IAM-specific guidance |
| `packages/_internal/db-admin/drizzle/0000_far_sleepwalker.sql` | Reference: Auto-generated migration |
| `packages/_internal/db-admin/drizzle/0001_custom_rls_extensions.sql` | Reference: Custom RLS migration |

---

## Success Criteria

- [ ] `@beep/shared-tables` AGENTS.md updated with:
  - [ ] RlsOptions documentation
  - [ ] Policy behavior table
  - [ ] Quick recipe for all three options
  - [ ] Guardrails for when to use each option
  - [ ] Gotcha for migration conflicts
  - [ ] Session table exception documentation
  - [ ] Custom migration maintenance note
- [ ] `@beep/iam-tables` AGENTS.md reviewed (may already be sufficient)
- [ ] `REFLECTION_LOG.md` updated with P4 learnings
- [ ] Spec marked as COMPLETE in `specs/README.md`

---

## Verification

```bash
# Ensure docs are syntactically correct (no broken markdown)
# Review rendered markdown in editor/viewer
```

---

## Notes

### Documentation Style

Follow existing AGENTS.md patterns:
- Use tables for option comparisons
- Use code blocks for examples
- Keep recipes self-contained and copy-pasteable
- Reference related files with relative paths

### Security Emphasis

Emphasize that auto-RLS is the **secure default**:
- Tables get tenant isolation without opt-in
- `'none'` requires explicit justification
- Manual policies should be rare exceptions

---

## Special Cases to Document

### Session Table Exception

The `shared_session` table uses `active_organization_id` instead of `organization_id` and cannot use `OrgTable.make`. Document this in AGENTS.md:

```markdown
### Tables That Cannot Use OrgTable.make

**shared_session**: Uses `active_organization_id` column for RLS instead of `organization_id`.
This is intentional - sessions track the user's currently active organization context,
not a fixed ownership relationship. RLS policy is defined in custom migration
`0001_custom_rls_extensions.sql`.
```

### Custom Migration Contents

The `0001_custom_rls_extensions.sql` migration handles:

| Table | Reason |
|-------|--------|
| `shared_session` | Uses `active_organization_id` column |
| `iam_invitation` | Uses `Table.make` with nullable `organizationId` |
| `iam_sso_provider` | Uses `Table.make` with nullable `organizationId` |
| `iam_scim_provider` | Uses `Table.make` with nullable `organizationId` |
| `rls_bypass_admin` role | Admin bypass role for migrations/maintenance |

---

## Future Work (Out of Scope)

### Consider for Future Tickets

1. **Migrate nullable orgId tables to OrgTable**
   - `iam_invitation`, `iam_sso_provider`, `iam_scim_provider` could use `OrgTable.make({ rlsPolicy: 'nullable' })`
   - Requires schema change: OrgTable enforces NOT NULL on organizationId
   - Would provide consistency but needs careful migration planning

2. **Fix identifier truncation warnings**
   - PostgreSQL truncates long FK constraint names (e.g., `knowledge_property_definition_organization_id_shared_organization_id_fk`)
   - Not breaking but produces console noise
   - Consider shorter naming convention in future migrations

3. **Test runner environment issue**
   - RLS tests fail through `bun run test --filter=@beep/db-admin` (turbo) but pass with `bun run dotenvx -- bun test`
   - Issue is environment variable loading through turbo cache
   - Workaround: Run RLS tests directly with dotenvx

---
