# Phase 2 Orchestrator Prompt

> Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 (RLS Policy Creation) of the RLS Implementation spec for beep-effect.

### Context

Phase 1 is complete. Infrastructure in place:
- **TenantContext Service**: `packages/shared/server/src/TenantContext/TenantContext.ts`
- **16 organization_id indexes** added across IAM, Shared, Documents, Knowledge packages
- **transactionWithTenant** method added to PgClient
- **Session Pattern**: `SET LOCAL app.current_org_id = 'uuid'`

### Your Mission

Create RLS policies for all 21 org-scoped tables.

#### Task 1: Create RLS Migration File

Create a custom SQL migration in `packages/_internal/db-admin/drizzle/` that:

1. **Enables RLS** on all 21 tables
2. **Creates tenant isolation policies** using session variable

**Policy Template**:
```sql
-- Enable RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Create policy (handles unset context by returning no rows)
CREATE POLICY tenant_isolation_{table_name} ON {table_name}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

#### Task 2: Apply to All 21 Tables

**IAM Tables** (11 tables in `packages/iam/tables/`):
- `member` → `tenant_isolation_member`
- `team` → `tenant_isolation_team`
- `team_member` → `tenant_isolation_team_member`
- `organization_role` → `tenant_isolation_organization_role`
- `subscription` → `tenant_isolation_subscription`
- `two_factor` → `tenant_isolation_two_factor`
- `api_key` → `tenant_isolation_api_key`
- `invitation` → `tenant_isolation_invitation`
- `sso_provider` → `tenant_isolation_sso_provider`
- `scim_provider` → `tenant_isolation_scim_provider`
- `session` → Special handling (uses `active_organization_id`)

**Shared Tables** (3 tables in `packages/shared/tables/`):
- `file` → `tenant_isolation_file`
- `folder` → `tenant_isolation_folder`
- `upload_session` → `tenant_isolation_upload_session`

**Documents Tables** (5 tables in `packages/documents/tables/`):
- `document` → `tenant_isolation_document`
- `discussion` → `tenant_isolation_discussion`
- `comment` → `tenant_isolation_comment`
- `document_file` → `tenant_isolation_document_file`
- `document_version` → `tenant_isolation_document_version`

**Knowledge Tables** (1 table in `packages/knowledge/tables/`):
- `embedding` → `tenant_isolation_embedding`

#### Task 3: Handle Session Table Specially

The `session` table uses `activeOrganizationId` (not `organizationId`):

```sql
ALTER TABLE session ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_session ON session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

#### Task 4: Create Admin Bypass Role (Optional)

For admin operations that need to bypass RLS:

```sql
-- Create bypass role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_bypass_admin') THEN
    CREATE ROLE rls_bypass_admin WITH BYPASSRLS;
  END IF;
END
$$;
```

### Critical Patterns

1. **Use `NULLIF(..., '')`** to handle unset session variable (returns NULL, which fails the check)
2. **Use `current_setting(..., TRUE)`** - the TRUE makes it return empty string instead of error when unset
3. **Cast to `::text`** since organization_id columns are text type

### Verification

Before completing Phase 2:
- [ ] Run `bun run db:migrate` - policies applied
- [ ] Verify policies exist:
  ```sql
  SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
  ```
- [ ] Manual test: Query without context returns 0 rows
- [ ] Manual test: Query with context returns filtered rows
- [ ] Update REFLECTION_LOG.md

### Handoff Document

Full context in: `specs/rls-implementation/handoffs/HANDOFF_P2.md`

After completing, create:
- `specs/rls-implementation/handoffs/HANDOFF_P3.md`
- `specs/rls-implementation/handoffs/P3_ORCHESTRATOR_PROMPT.md`
