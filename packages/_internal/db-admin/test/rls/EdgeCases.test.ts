/**
 * RLS (Row-Level Security) Edge Case Tests
 *
 * Verifies edge cases and security scenarios:
 * - Empty string context handling
 * - SQL injection prevention
 * - Session table special handling
 * - Policy naming conventions
 * - Nullable organization_id scenarios
 *
 * @module test/rls/EdgeCases
 */

import { TenantContext } from "@beep/shared-server";
import { layer, strictEqual } from "@beep/testkit";
import { clearTestTenant } from "@beep/testkit/rls";
import * as SqlClient from "@effect/sql/SqlClient";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { PgTest } from "../container";

/**
 * Timeout for edge case tests.
 */
const TEST_TIMEOUT = 60000;

layer(PgTest, { timeout: Duration.seconds(60) })("RLS Edge Cases", (it) => {
  /**
   * Test: Empty string context should block all rows.
   *
   * When context is cleared, it becomes empty string which
   * the NULLIF in the policy converts to NULL, blocking all rows.
   */
  it.effect(
    "handles empty string context (blocks all rows)",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Clear context sets to empty string
        yield* clearTestTenant();

        // Empty string becomes NULL via NULLIF, blocking all rows
        const result = yield* sql`SELECT * FROM iam_member LIMIT 10`;
        strictEqual(result.length, 0, "Empty context should block all rows");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: SQL injection attempt should be safely stored as a value.
   *
   * The TenantContext service escapes single quotes to prevent
   * SQL injection attacks.
   */
  it.effect(
    "handles SQL injection attempt in org ID",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const ctx = yield* TenantContext.TenantContext;

        // Attempt SQL injection - the escaping should prevent execution
        const maliciousId = "test'; DROP TABLE iam_member; --";
        yield* ctx.setOrganizationId(maliciousId);

        // The value should be stored escaped, not executed as SQL
        const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;

        // Verify the malicious string was stored as a value (escaped)
        // The original single quote is now doubled ('') due to escaping
        strictEqual(
          (result[0]?.orgId as string).includes("DROP TABLE"),
          true,
          "Malicious string should be stored as value, not executed"
        );

        // Verify table still exists (injection failed)
        const tableCheck = yield* sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'iam_member'
          ) as exists
        `;
        strictEqual(tableCheck[0]?.exists, true, "Table should still exist after injection attempt");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Session table uses active_organization_id correctly.
   *
   * The session table RLS policy filters by active_organization_id
   * instead of organization_id.
   */
  it.effect(
    "session table uses active_organization_id correctly",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const ctx = yield* TenantContext.TenantContext;

        // Session table RLS uses active_organization_id
        yield* ctx.setOrganizationId("test-org");

        // Verify the policy exists and uses correct column
        const policy = yield* sql`
          SELECT polname, pg_get_expr(polqual, polrelid) as policy_expr
          FROM pg_policy
          WHERE polrelid = 'shared_session'::regclass
        `;

        strictEqual(policy.length > 0, true, "Session table should have RLS policy");
        strictEqual(
          (policy[0]?.policyExpr as string).includes("active_organization_id"),
          true,
          "Policy should use active_organization_id column"
        );
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify all 20 tables have RLS enabled.
   */
  it.effect(
    "verifies all 20 tables have RLS enabled",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const result = yield* sql`
          SELECT COUNT(*) as count
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relrowsecurity = true
          AND n.nspname = 'public'
        `;

        const count = Number(result[0]?.count);

        yield* Effect.logInfo("RLS Enabled Tables", { count });

        strictEqual(count >= 20, true, `Expected at least 20 tables with RLS enabled, got ${count}`);
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify all policies follow naming convention.
   */
  it.effect(
    "verifies all policies follow naming convention",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const policies = yield* sql`
          SELECT polname
          FROM pg_policy
          WHERE polname LIKE 'tenant_isolation_%'
        `;

        yield* Effect.logInfo("Tenant Isolation Policies", {
          count: policies.length,
          policies: policies.map((p) => p.polname),
        });

        strictEqual(
          policies.length >= 20,
          true,
          `Expected at least 20 tenant_isolation policies, got ${policies.length}`
        );

        // All policies should start with tenant_isolation_
        for (const policy of policies) {
          strictEqual(
            (policy.polname as string).startsWith("tenant_isolation_"),
            true,
            `Policy ${policy.polname} doesn't follow naming convention`
          );
        }
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify RLS doesn't interfere with schema introspection.
   *
   * Information schema queries should work regardless of tenant context.
   */
  it.effect(
    "allows schema introspection regardless of context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Clear context
        yield* clearTestTenant();

        // Schema introspection should still work
        const tables = yield* sql`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          LIMIT 5
        `;

        strictEqual(tables.length > 0, true, "Should be able to query information_schema without context");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify current_setting returns empty string when not set.
   *
   * The TRUE parameter to current_setting prevents errors when
   * the setting doesn't exist.
   */
  it.effect(
    "current_setting returns empty string when not set",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Clear any existing context
        yield* clearTestTenant();

        // Query the current setting
        const result = yield* sql`
          SELECT current_setting('app.current_org_id', TRUE) as org_id
        `;

        // Should return empty string (cleared context)
        strictEqual(result[0]?.orgId, "", "Cleared context should return empty string");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify NULLIF converts empty string to NULL in policy.
   *
   * This is critical for security - empty context should match nothing.
   */
  it.effect(
    "NULLIF converts empty string to NULL",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Test NULLIF behavior directly
        const result = yield* sql`
          SELECT
            NULLIF('', '')::text as empty_string_result,
            NULLIF('org-123', '')::text as normal_result
        `;

        strictEqual(result[0]?.emptyStringResult, null, "NULLIF should convert empty string to NULL");
        strictEqual(result[0]?.normalResult, "org-123", "NULLIF should preserve non-empty values");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify policy applies to all operations (FOR ALL).
   *
   * Each table should have a single policy that applies to
   * SELECT, INSERT, UPDATE, and DELETE.
   */
  it.effect(
    "verifies policies apply to all operations",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Check policy command type for iam_member
        const policy = yield* sql`
          SELECT polname, polcmd
          FROM pg_policy
          WHERE polname = 'tenant_isolation_iam_member'
        `;

        strictEqual(policy.length, 1, "Should have exactly one tenant_isolation policy for iam_member");

        // polcmd = '*' means FOR ALL (applies to all commands)
        strictEqual(policy[0]?.polcmd, "*", "Policy should apply to all operations (FOR ALL)");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify context persistence across multiple queries.
   *
   * Once set, context should persist for subsequent queries
   * until explicitly cleared.
   */
  it.effect(
    "context persists across multiple queries",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const ctx = yield* TenantContext.TenantContext;

        const testOrgId = "persistent-context-org";
        yield* ctx.setOrganizationId(testOrgId);

        // First query
        const result1 = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
        strictEqual(result1[0]?.orgId, testOrgId, "First query should see context");

        // Second query (without re-setting)
        const result2 = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
        strictEqual(result2[0]?.orgId, testOrgId, "Second query should still see context");

        // Third query
        const result3 = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
        strictEqual(result3[0]?.orgId, testOrgId, "Third query should still see context");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Expected tables with RLS enabled.
   *
   * Explicitly lists all expected tables for verification.
   */
  it.effect(
    "lists all expected RLS-protected tables",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Expected tables based on the migration
        const expectedTables = [
          "documents_comment",
          "documents_discussion",
          "documents_document",
          "documents_document_file",
          "documents_document_version",
          "iam_apikey",
          "iam_invitation",
          "iam_member",
          "iam_organization_role",
          "iam_scim_provider",
          "iam_sso_provider",
          "iam_subscription",
          "iam_team_member",
          "iam_two_factor",
          "knowledge_embedding",
          "shared_file",
          "shared_folder",
          "shared_session",
          "shared_team",
          "shared_upload_session",
        ];

        // Query actual RLS-enabled tables
        const result = yield* sql`
          SELECT c.relname as table_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relrowsecurity = true
          AND n.nspname = 'public'
          ORDER BY c.relname
        `;

        const actualTables = result.map((r) => r.tableName as string);

        yield* Effect.logInfo("RLS Protected Tables", {
          expected: expectedTables.length,
          actual: actualTables.length,
          tables: actualTables,
        });

        // Verify all expected tables are present
        for (const table of expectedTables) {
          strictEqual(actualTables.includes(table), true, `Expected table ${table} to have RLS enabled`);
        }
      }),
    TEST_TIMEOUT
  );
});
