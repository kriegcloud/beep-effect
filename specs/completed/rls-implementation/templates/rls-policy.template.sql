-- ============================================================================
-- RLS Policy Template for beep-effect
-- ============================================================================
--
-- Usage:
--   1. Copy this template
--   2. Replace {{TABLE_NAME}} with actual table name (snake_case)
--   3. Add to a Drizzle migration file in packages/_internal/db-admin/drizzle/
--
-- Prerequisites:
--   - Table must have organization_id column (via OrgTable.make())
--   - PostgreSQL session variable 'app.current_org_id' must be set before queries
--
-- ============================================================================

-- Enable Row-Level Security on the table
-- This is required before any policies can be created
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Option A: Single FOR ALL policy (simpler, recommended for most cases)
-- ============================================================================

CREATE POLICY tenant_isolation_{{TABLE_NAME}} ON {{TABLE_NAME}}
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ============================================================================
-- Option B: Separate policies per operation (more granular control)
-- Uncomment if different USING/WITH CHECK logic needed per operation
-- ============================================================================

-- -- Read operations
-- CREATE POLICY tenant_read_{{TABLE_NAME}} ON {{TABLE_NAME}}
--   FOR SELECT
--   USING (organization_id = current_setting('app.current_org_id')::uuid);

-- -- Insert operations (WITH CHECK ensures new rows match context)
-- CREATE POLICY tenant_insert_{{TABLE_NAME}} ON {{TABLE_NAME}}
--   FOR INSERT
--   WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

-- -- Update operations (both USING and WITH CHECK)
-- CREATE POLICY tenant_update_{{TABLE_NAME}} ON {{TABLE_NAME}}
--   FOR UPDATE
--   USING (organization_id = current_setting('app.current_org_id')::uuid)
--   WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

-- -- Delete operations
-- CREATE POLICY tenant_delete_{{TABLE_NAME}} ON {{TABLE_NAME}}
--   FOR DELETE
--   USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ============================================================================
-- Ensure index exists for RLS predicate performance
-- This is critical for query performance with RLS enabled
-- ============================================================================

CREATE INDEX IF NOT EXISTS {{TABLE_NAME}}_organization_id_rls_idx
  ON {{TABLE_NAME}} (organization_id);

-- ============================================================================
-- Verification queries (run after migration to confirm RLS is active)
-- Replace {{TABLE_NAME}} with actual table name before executing
-- ============================================================================

-- 1. Check RLS is enabled on the table:
--    Expected: relrowsecurity = true
--
--    SELECT relname, relrowsecurity
--    FROM pg_class
--    WHERE relname = '{{TABLE_NAME}}';

-- 2. List policies on the table:
--    Expected: At least one policy with name starting with 'tenant_'
--
--    SELECT polname, polcmd, polqual
--    FROM pg_policy
--    WHERE polrelid = '{{TABLE_NAME}}'::regclass;

-- 3. Test isolation WITHOUT context (should return empty or error):
--    Expected: Zero rows returned
--
--    RESET app.current_org_id;  -- Clear any existing context
--    SELECT * FROM {{TABLE_NAME}} LIMIT 1;

-- 4. Test WITH valid context:
--    Expected: Only rows matching the specified org_id
--
--    SELECT set_config('app.current_org_id', 'your-org-uuid-here', false);
--    SELECT * FROM {{TABLE_NAME}} LIMIT 5;

-- ============================================================================
-- Example: Applying this template to iam_member table
-- ============================================================================
--
-- ALTER TABLE iam_member ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY tenant_isolation_iam_member ON iam_member
--   FOR ALL
--   USING (organization_id = current_setting('app.current_org_id')::uuid);
--
-- CREATE INDEX IF NOT EXISTS iam_member_organization_id_rls_idx
--   ON iam_member (organization_id);
