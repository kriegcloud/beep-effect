-- ============================================================================
-- Custom RLS Extensions Migration
-- ============================================================================
-- This migration adds RLS policies for tables that don't use OrgTable.make
-- and creates the admin bypass role for administrative operations.
-- ============================================================================

-- ============================================================================
-- Session Table (uses active_organization_id instead of organization_id)
-- ============================================================================

ALTER TABLE shared_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shared_session ON shared_session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- Invitation Table (uses Table.make with nullable organizationId)
-- ============================================================================

ALTER TABLE iam_invitation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_invitation ON iam_invitation
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- SSO Provider Table (uses Table.make with nullable organizationId)
-- ============================================================================

ALTER TABLE iam_sso_provider ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_sso_provider ON iam_sso_provider
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- SCIM Provider Table (uses Table.make with nullable organizationId)
-- ============================================================================

ALTER TABLE iam_scim_provider ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_scim_provider ON iam_scim_provider
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- Admin Bypass Role
-- ============================================================================
-- Creates a role that can bypass RLS for administrative operations.
-- This role should be granted sparingly and only for:
-- - Migration scripts
-- - Cross-tenant admin operations
-- - System maintenance tasks
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_bypass_admin') THEN
    CREATE ROLE rls_bypass_admin WITH BYPASSRLS NOLOGIN;
    COMMENT ON ROLE rls_bypass_admin IS 'Role that bypasses RLS for administrative operations';
  END IF;
END
$$;
