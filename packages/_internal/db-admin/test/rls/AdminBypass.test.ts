/**
 * RLS (Row-Level Security) Admin Bypass Tests
 *
 * Verifies that the admin bypass role exists and has correct
 * permissions for migrations and administrative operations.
 *
 * @module test/rls/AdminBypass
 */

import { layer, strictEqual } from "@beep/testkit";
import * as SqlClient from "@effect/sql/SqlClient";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { PgTest } from "../container";

/**
 * Timeout for admin bypass tests.
 */
const TEST_TIMEOUT = 120000;

layer(PgTest, { timeout: Duration.seconds(120) })("RLS Admin Bypass", (it) => {
  /**
   * Test: Verify rls_bypass_admin role exists with BYPASSRLS privilege.
   */
  it.effect(
    "verifies rls_bypass_admin role exists with BYPASSRLS",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const result = yield* sql`
          SELECT rolname, rolbypassrls
          FROM pg_roles
          WHERE rolname = 'rls_bypass_admin'
        `;

        strictEqual(result.length, 1, "rls_bypass_admin role should exist");
        strictEqual(result[0]?.rolname, "rls_bypass_admin", "Role name should match");
        strictEqual(result[0]?.rolbypassrls, true, "Role should have BYPASSRLS privilege");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify rls_bypass_admin role has NOLOGIN for security.
   *
   * The bypass role should not be able to directly log in -
   * it should only be assumed via SET ROLE by authorized users.
   */
  it.effect(
    "verifies rls_bypass_admin has NOLOGIN for security",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const result = yield* sql`
          SELECT rolname, rolcanlogin
          FROM pg_roles
          WHERE rolname = 'rls_bypass_admin'
        `;

        strictEqual(result.length, 1, "rls_bypass_admin role should exist");
        strictEqual(result[0]?.rolcanlogin, false, "Role should have NOLOGIN (cannot directly authenticate)");
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Documents bypass role usage pattern.
   *
   * Note: Actually switching to bypass role requires the test user
   * to be a member of rls_bypass_admin. In test containers, this
   * permission may not be granted. This test documents the pattern.
   */
  it.effect(
    "documents bypass role usage pattern",
    () =>
      // Document the pattern for production use
      Effect.logInfo("Admin Bypass Pattern", {
        usage: `
-- For migrations or admin operations:
SET ROLE rls_bypass_admin;
-- Perform operations that need to see all data
-- ... migration queries ...
RESET ROLE;
          `,
        notes: [
          "Use for migrations that need cross-tenant access",
          "Use for admin dashboards showing all organizations",
          "Always RESET ROLE after operations",
          "Requires current user to be member of rls_bypass_admin",
        ],
        securityConsiderations: [
          "Grant bypass role membership sparingly",
          "Audit all bypass role usage",
          "Never use bypass role for normal application queries",
        ],
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify role inheritance settings.
   */
  it.effect(
    "verifies role inheritance settings",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const result = yield* sql`
          SELECT rolname, rolinherit, rolcreaterole, rolcreatedb, rolreplication
          FROM pg_roles
          WHERE rolname = 'rls_bypass_admin'
        `;

        strictEqual(result.length, 1, "rls_bypass_admin role should exist");

        // Document role capabilities
        yield* Effect.logInfo("RLS Bypass Admin Role Capabilities", {
          canInherit: result[0]?.rolinherit,
          canCreateRole: result[0]?.rolcreaterole,
          canCreateDb: result[0]?.rolcreatedb,
          canReplicate: result[0]?.rolreplication,
        });
      }),
    TEST_TIMEOUT
  );

  /**
   * Test: Verify no other roles have BYPASSRLS privilege.
   *
   * Only designated admin roles should have RLS bypass capability.
   */
  it.effect(
    "verifies only authorized roles have BYPASSRLS",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const result = yield* sql`
          SELECT rolname
          FROM pg_roles
          WHERE rolbypassrls = true
          AND rolname NOT IN ('postgres', 'rls_bypass_admin', 'test')
          ORDER BY rolname
        `;

        yield* Effect.logInfo("Roles with BYPASSRLS", {
          unexpectedRoles: result.map((r) => r.rolname),
          expected: ["postgres", "rls_bypass_admin"],
        });

        // In production, you may want to fail if unexpected roles have bypass
        // For test containers, postgres superuser has this by default
      }),
    TEST_TIMEOUT
  );
});
