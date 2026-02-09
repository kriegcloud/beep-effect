/**
 * RLS (Row-Level Security) Tenant Isolation Tests
 *
 * Verifies that RLS policies properly enforce tenant isolation:
 * - Queries return 0 rows without tenant context
 * - Queries return only matching tenant rows with context
 * - Session table uses active_organization_id for filtering
 *
 * @module test/rls/TenantIsolation
 */

import { TenantContext } from "@beep/shared-server";
import { layer, strictEqual } from "@beep/testkit";
import { assertNoRowsWithoutContext, clearTestTenant, setTestTenant, withTestTenant } from "@beep/testkit/rls";
import * as SqlClient from "@effect/sql/SqlClient";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { PgTest } from "../container";

/**
 * Timeout for tests that interact with the database.
 * Extended to account for container startup time.
 */
const TEST_TIMEOUT = 120000;

layer(PgTest, { timeout: Duration.seconds(120) })("RLS Tenant Isolation", (it) => {
  // ==========================================================================
  // Basic RLS Policy Tests
  // ==========================================================================

  /**
   * Test: Without tenant context, RLS should block all rows.
   *
   * This uses direct SQL (bypassing repo abstraction) to test RLS
   * at the database level, ensuring the policy works regardless of
   * application code.
   */
  it.effect(
    "blocks SELECT on iam_member without tenant context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const result = yield* sql`SELECT * FROM iam_member LIMIT 10`;
        strictEqual(result.length, 0);
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "blocks SELECT on shared_team without tenant context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const result = yield* sql`SELECT * FROM shared_team LIMIT 10`;
        strictEqual(result.length, 0);
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "blocks SELECT on documents_document without tenant context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const result = yield* sql`SELECT * FROM documents_document LIMIT 10`;
        strictEqual(result.length, 0);
      }),
    TEST_TIMEOUT
  );

  // ==========================================================================
  // Session Table Special Handling
  // ==========================================================================

  /**
   * Test session table special handling.
   * Session table uses active_organization_id column instead of organization_id.
   */
  it.effect(
    "blocks SELECT on shared_session without tenant context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const result = yield* sql`SELECT * FROM shared_session LIMIT 10`;
        strictEqual(result.length, 0);
      }),
    TEST_TIMEOUT
  );

  // ==========================================================================
  // Context Setting Tests
  // ==========================================================================

  /**
   * Test: Verify TenantContext service is available and can set context.
   */
  it.effect(
    "TenantContext service is available in test layer",
    () =>
      Effect.gen(function* () {
        const ctx = yield* TenantContext.TenantContext;

        // Setting context should not throw
        yield* ctx.setOrganizationId("test-org-123");

        // Verify we can check the current setting
        const sql = yield* SqlClient.SqlClient;
        const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
        strictEqual(result[0]?.orgId, "test-org-123");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify withOrganization scopes queries properly.
   */
  it.effect(
    "withOrganization sets context for nested queries",
    () =>
      Effect.gen(function* () {
        const ctx = yield* TenantContext.TenantContext;
        const sql = yield* SqlClient.SqlClient;

        const orgId = yield* ctx.withOrganization(
          "scoped-org-456",
          Effect.gen(function* () {
            const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
            return result[0]?.orgId as string;
          })
        );

        strictEqual(orgId, "scoped-org-456");
      }),
    TEST_TIMEOUT
  );

  // ==========================================================================
  // RLS Helper Tests
  // ==========================================================================

  /**
   * Test: Using RLS helper to verify no rows without context.
   */
  it.effect(
    "assertNoRowsWithoutContext works for iam_member",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* assertNoRowsWithoutContext(sql`SELECT * FROM iam_member LIMIT 100`);
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Using withTestTenant helper.
   */
  it.effect(
    "withTestTenant sets organization context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const orgId = yield* withTestTenant(
          "helper-org-789",
          Effect.gen(function* () {
            const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
            return result[0]?.orgId as string;
          })
        );

        strictEqual(orgId, "helper-org-789");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: setTestTenant and clearTestTenant helpers.
   */
  it.effect(
    "setTestTenant and clearTestTenant work correctly",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Set context
        yield* setTestTenant("set-clear-org-123");

        // Verify it's set
        const beforeClear = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
        strictEqual(beforeClear[0]?.orgId, "set-clear-org-123");

        // Clear context
        yield* clearTestTenant();

        // Verify it's cleared (empty string)
        const afterClear = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;
        strictEqual(afterClear[0]?.orgId, "");
      }),
    TEST_TIMEOUT
  );

  // ==========================================================================
  // Cross-Table RLS Verification
  // ==========================================================================

  /**
   * Test: Verify RLS is enabled on expected tables.
   * This is a meta-test to ensure policies exist.
   */
  it.effect(
    "verifies RLS policies exist on all tenant-scoped tables",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        // Query pg_catalog for RLS-enabled tables with our policies
        const result = yield* sql`
          SELECT
            schemaname,
            tablename,
            policyname
          FROM pg_policies
          WHERE policyname LIKE 'tenant_isolation_%'
          ORDER BY tablename
        `;

        // Tables with RLS policies from migrations:
        // - 0000_oval_amphibian.sql: OrgTable.make auto-generated policies (26 tables)
        // - 0001_custom_rls_extensions.sql: Custom policies for special tables (4 tables)
        const expectedTables = [
          "comms_email_template",
          "documents_comment",
          "documents_discussion",
          "documents_document",
          "documents_document_file",
          "documents_document_version",
          "iam_apikey",
          "iam_invitation", // Custom migration
          "iam_member",
          "iam_organization_role",
          "iam_scim_provider", // Custom migration
          "iam_sso_provider", // Custom migration
          "iam_subscription",
          "iam_team_member",
          "iam_two_factor",
          "knowledge_class_definition",
          "knowledge_embedding",
          "knowledge_entity",
          "knowledge_entity_cluster",
          "knowledge_extraction",
          "knowledge_mention",
          "knowledge_ontology",
          "knowledge_property_definition",
          "knowledge_relation",
          "knowledge_same_as_link",
          "shared_file",
          "shared_folder",
          "shared_session", // Custom migration (uses active_organization_id)
          "shared_team",
          "shared_upload_session",
        ];

        // Verify we have policies for all expected tables
        const tablesWithPolicies = result.map((r) => r.tablename as string);

        for (const table of expectedTables) {
          if (!tablesWithPolicies.includes(table)) {
            return yield* Effect.die(new Error(`Missing RLS policy for table: ${table}`));
          }
        }

        // Log the count for visibility
        yield* Effect.logInfo(`Found ${result.length} RLS policies`);
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify admin bypass role exists.
   */
  it.effect(
    "verifies rls_bypass_admin role exists",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const result = yield* sql`
          SELECT rolname, rolbypassrls
          FROM pg_roles
          WHERE rolname = 'rls_bypass_admin'
        `;

        strictEqual(result.length, 1);
        strictEqual(result[0]?.rolname, "rls_bypass_admin");
        strictEqual(result[0]?.rolbypassrls, true);
      }),
    TEST_TIMEOUT
  );
});
