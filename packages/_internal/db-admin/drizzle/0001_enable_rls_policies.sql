-- ============================================================================
-- RLS (Row-Level Security) Policy Migration
-- ============================================================================
-- Enables row-level security and creates tenant isolation policies for all
-- organization-scoped tables. Uses PostgreSQL session variable
-- `app.current_org_id` set via `SET LOCAL` within transactions.
--
-- Policy Pattern:
-- - USING clause: Filters rows on SELECT/UPDATE/DELETE based on org context
-- - WITH CHECK clause: Validates org context on INSERT/UPDATE
-- - NULLIF handles unset context by returning NULL (fails comparison, returns no rows)
-- - current_setting(..., TRUE) returns empty string instead of error when unset
-- ============================================================================

-- ============================================================================
-- IAM Tables (11 tables)
-- ============================================================================

-- iam_member
ALTER TABLE iam_member ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_member ON iam_member
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- shared_team (part of IAM slice logically)
ALTER TABLE shared_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shared_team ON shared_team
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_team_member
ALTER TABLE iam_team_member ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_team_member ON iam_team_member
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_organization_role
ALTER TABLE iam_organization_role ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_organization_role ON iam_organization_role
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_subscription
ALTER TABLE iam_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_subscription ON iam_subscription
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_two_factor
ALTER TABLE iam_two_factor ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_two_factor ON iam_two_factor
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_apikey
ALTER TABLE iam_apikey ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_apikey ON iam_apikey
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_invitation (organization_id is nullable - rows with NULL will not be visible)
ALTER TABLE iam_invitation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_invitation ON iam_invitation
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_sso_provider (organization_id is nullable - rows with NULL will not be visible)
ALTER TABLE iam_sso_provider ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_sso_provider ON iam_sso_provider
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- iam_scim_provider (organization_id is nullable - rows with NULL will not be visible)
ALTER TABLE iam_scim_provider ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_iam_scim_provider ON iam_scim_provider
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- shared_session (SPECIAL: uses active_organization_id instead of organization_id)
ALTER TABLE shared_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shared_session ON shared_session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- Shared Tables (3 tables)
-- ============================================================================

-- shared_file
ALTER TABLE shared_file ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shared_file ON shared_file
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- shared_folder
ALTER TABLE shared_folder ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shared_folder ON shared_folder
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- shared_upload_session
ALTER TABLE shared_upload_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shared_upload_session ON shared_upload_session
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- Documents Tables (5 tables)
-- ============================================================================

-- documents_document
ALTER TABLE documents_document ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_documents_document ON documents_document
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- documents_discussion
ALTER TABLE documents_discussion ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_documents_discussion ON documents_discussion
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- documents_comment
ALTER TABLE documents_comment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_documents_comment ON documents_comment
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- documents_document_file
ALTER TABLE documents_document_file ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_documents_document_file ON documents_document_file
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- documents_document_version
ALTER TABLE documents_document_version ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_documents_document_version ON documents_document_version
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- Knowledge Tables (6 tables)
-- ============================================================================

-- knowledge_embedding
ALTER TABLE knowledge_embedding ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_knowledge_embedding ON knowledge_embedding
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- knowledge_entity
ALTER TABLE knowledge_entity ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_knowledge_entity ON knowledge_entity
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- knowledge_relation
ALTER TABLE knowledge_relation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_knowledge_relation ON knowledge_relation
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- knowledge_ontology
ALTER TABLE knowledge_ontology ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_knowledge_ontology ON knowledge_ontology
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- knowledge_extraction
ALTER TABLE knowledge_extraction ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_knowledge_extraction ON knowledge_extraction
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- knowledge_mention
ALTER TABLE knowledge_mention ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_knowledge_mention ON knowledge_mention
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
--> statement-breakpoint

-- ============================================================================
-- Admin Bypass Role (Optional)
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
