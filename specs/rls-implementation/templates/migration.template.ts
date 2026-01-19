/**
 * Drizzle Custom Migration Template for RLS Policies
 *
 * Drizzle Kit generates SQL migrations from schema changes, but RLS policies
 * require custom SQL. This template shows how to create custom migrations
 * that add RLS policies alongside Drizzle-generated migrations.
 *
 * Usage:
 *   1. Run `bun run db:generate` to create schema migrations
 *   2. Create a new SQL file in packages/_internal/db-admin/drizzle/
 *   3. Name it with next sequence number: `0002_rls_policies.sql`
 *   4. Add custom SQL from templates/rls-policy.template.sql
 *   5. Run `bun run db:migrate` to apply
 *
 * See: packages/_internal/db-admin/AGENTS.md for migration workflow
 */

// =============================================================================
// Migration File Naming Convention
// =============================================================================
//
// Drizzle Kit generates files like: `0000_fresh_invisible_woman.sql`
// Custom migrations should follow the same pattern:
//
// Format: `NNNN_<descriptive_name>.sql`
// - NNNN: Four-digit sequence number (0001, 0002, etc.)
// - descriptive_name: Snake_case description
//
// Examples:
// - 0002_enable_rls_iam_tables.sql
// - 0003_add_rls_documents_tables.sql
// - 0004_rls_tenant_bypass_policy.sql

// =============================================================================
// Example Custom Migration: IAM Tables RLS
// =============================================================================
//
// File: packages/_internal/db-admin/drizzle/0002_enable_rls_iam_tables.sql
//
// ```sql
// -- ============================================================================
// -- Enable Row-Level Security on IAM Tables
// -- Migration: 0002_enable_rls_iam_tables.sql
// -- Created: 2026-01-XX
// -- ============================================================================
//
// -- Member table
// ALTER TABLE iam_member ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY tenant_isolation_iam_member ON iam_member
//   FOR ALL
//   USING (organization_id = current_setting('app.current_org_id')::uuid);
//
// CREATE INDEX IF NOT EXISTS iam_member_organization_id_rls_idx
//   ON iam_member (organization_id);
//
// --> statement-breakpoint
//
// -- Team table
// ALTER TABLE iam_team ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY tenant_isolation_iam_team ON iam_team
//   FOR ALL
//   USING (organization_id = current_setting('app.current_org_id')::uuid);
//
// CREATE INDEX IF NOT EXISTS iam_team_organization_id_rls_idx
//   ON iam_team (organization_id);
//
// --> statement-breakpoint
//
// -- TeamMember table
// ALTER TABLE iam_team_member ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY tenant_isolation_iam_team_member ON iam_team_member
//   FOR ALL
//   USING (organization_id = current_setting('app.current_org_id')::uuid);
//
// CREATE INDEX IF NOT EXISTS iam_team_member_organization_id_rls_idx
//   ON iam_team_member (organization_id);
// ```

// =============================================================================
// Statement Breakpoints
// =============================================================================
//
// Drizzle uses `--> statement-breakpoint` comments to separate SQL statements.
// This is important for:
// 1. Transaction handling (each statement can be separate transaction)
// 2. Error recovery (know which statement failed)
// 3. Rollback granularity
//
// For RLS migrations, group related statements (ALTER + CREATE POLICY + INDEX)
// and add breakpoints between different tables.

// =============================================================================
// Migration Journal Update
// =============================================================================
//
// Custom migrations must be registered in the Drizzle journal.
// File: packages/_internal/db-admin/drizzle/meta/_journal.json
//
// IMPORTANT: The journal is auto-managed by `drizzle-kit`. For custom migrations:
// 1. Create the .sql file
// 2. Run `bun run db:migrate` - Drizzle will detect and apply it
// 3. The journal updates automatically
//
// DO NOT manually edit _journal.json unless recovering from corruption.

// =============================================================================
// Rollback Strategy
// =============================================================================
//
// Drizzle does not auto-generate rollback migrations. For RLS:
//
// Create corresponding down migration (not auto-applied, for manual recovery):
//
// File: packages/_internal/db-admin/drizzle/down/0002_down_disable_rls_iam.sql
//
// ```sql
// -- Disable RLS on IAM tables (rollback)
// DROP POLICY IF EXISTS tenant_isolation_iam_member ON iam_member;
// ALTER TABLE iam_member DISABLE ROW LEVEL SECURITY;
//
// DROP POLICY IF EXISTS tenant_isolation_iam_team ON iam_team;
// ALTER TABLE iam_team DISABLE ROW LEVEL SECURITY;
//
// DROP POLICY IF EXISTS tenant_isolation_iam_team_member ON iam_team_member;
// ALTER TABLE iam_team_member DISABLE ROW LEVEL SECURITY;
// ```

// =============================================================================
// Verification Queries
// =============================================================================
//
// After running migration, verify RLS is properly configured:
//
// ```sql
// -- Check RLS is enabled on all expected tables
// SELECT relname, relrowsecurity
// FROM pg_class
// WHERE relname IN ('iam_member', 'iam_team', 'iam_team_member')
// ORDER BY relname;
//
// -- List all RLS policies
// SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
// FROM pg_policies
// WHERE tablename LIKE 'iam_%'
// ORDER BY tablename;
//
// -- Verify indexes exist
// SELECT indexname, tablename
// FROM pg_indexes
// WHERE indexname LIKE '%_organization_id_rls_idx'
// ORDER BY tablename;
// ```

// =============================================================================
// Admin/Bypass Policy (Optional)
// =============================================================================
//
// For admin operations that need to bypass RLS:
//
// ```sql
// -- Create admin bypass policy (use sparingly)
// CREATE POLICY admin_bypass_iam_member ON iam_member
//   FOR ALL
//   TO admin_role
//   USING (true);
//
// -- Or use session variable for bypass flag
// CREATE POLICY admin_bypass_iam_member ON iam_member
//   FOR ALL
//   USING (
//     current_setting('app.current_org_id')::uuid = organization_id
//     OR current_setting('app.bypass_rls', true)::boolean = true
//   );
// ```
//
// SECURITY WARNING: Bypass policies should be used with extreme caution.
// Prefer setting context correctly over bypassing RLS.

// =============================================================================
// TypeScript Helper (for programmatic migration generation)
// =============================================================================

/**
 * Generate RLS policy SQL for a given table.
 * Use this to programmatically generate migration SQL if needed.
 */
export const generateRlsPolicySql = (tableName: string): string => `
-- Enable RLS on ${tableName}
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_${tableName} ON ${tableName}
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE INDEX IF NOT EXISTS ${tableName}_organization_id_rls_idx
  ON ${tableName} (organization_id);
`.trim();

/**
 * Generate RLS migration for multiple tables.
 */
export const generateRlsMigration = (tableNames: readonly string[]): string => {
  const header = `-- ============================================================================
-- Enable Row-Level Security
-- Generated: ${new Date().toISOString().split("T")[0]}
-- ============================================================================
`;

  const policies = tableNames.map((name) => generateRlsPolicySql(name)).join("\n\n--> statement-breakpoint\n\n");

  return `${header}\n${policies}`;
};

// Example usage:
// const migration = generateRlsMigration([
//   'iam_member',
//   'iam_team',
//   'iam_team_member',
//   'iam_invitation'
// ]);
// console.log(migration);
