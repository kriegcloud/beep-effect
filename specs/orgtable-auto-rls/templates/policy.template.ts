/**
 * RLS Policy Templates for OrgTable.make
 *
 * This file documents the policy patterns that will be auto-generated
 * by the modified OrgTable.make factory.
 */

import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

// =============================================================================
// POLICY TEMPLATES
// =============================================================================

/**
 * Standard tenant isolation policy.
 * Used when organizationId is NOT NULL (default for most org-scoped tables).
 *
 * @param tableName - The table name from entityId.tableName
 */
export const standardPolicy = (tableName: string) =>
  pg.pgPolicy(`tenant_isolation_${tableName}`, {
    as: "permissive",
    for: "all",
    using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  });

/**
 * Nullable tenant isolation policy.
 * Used when organizationId CAN be NULL (e.g., ssoProvider, scimProvider).
 * Allows access to rows where organizationId is NULL OR matches context.
 *
 * @param tableName - The table name from entityId.tableName
 */
export const nullablePolicy = (tableName: string) =>
  pg.pgPolicy(`tenant_isolation_${tableName}`, {
    as: "permissive",
    for: "all",
    using: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    withCheck: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  });

// =============================================================================
// USAGE EXAMPLES (Post-Implementation)
// =============================================================================

/*
// Example 1: Standard usage (implicit RLS - default)
// Most tables use this pattern
export const member = OrgTable.make(IamEntityIds.MemberId)(
  {
    userId: pg.text("user_id").notNull(),
    role: memberRoleEnum("role").notNull(),
  },
  (t) => [
    pg.index("member_user_id_idx").on(t.userId),
    pg.index("member_role_idx").on(t.role),
  ]
);
// Result: Automatic tenant_isolation_member policy + .enableRLS()


// Example 2: Nullable organizationId (explicit option)
// For tables where organizationId can be NULL
export const ssoProvider = OrgTable.make(IamEntityIds.SsoProviderId, { rlsPolicy: 'nullable' })(
  {
    domain: pg.text("domain").notNull(),
    isEnabled: pg.boolean("is_enabled").notNull().default(true),
  },
  (t) => [
    pg.uniqueIndex("sso_domain_idx").on(t.domain),
  ]
);
// Result: Automatic nullable policy allowing NULL or matching orgId


// Example 3: Opt-out (custom policy needed)
// Rare case where you need manual policy control
export const specialTable = OrgTable.make(EntityIds.SpecialId, { rlsPolicy: 'none' })(
  {
    data: pg.text("data"),
  },
  (t) => [
    // Define your own custom policy here
    pg.pgPolicy("custom_policy_special", {
      as: "permissive",
      for: "select",
      using: sql`some_custom_condition`,
    }),
  ]
).enableRLS();
// Note: Must call .enableRLS() manually when rlsPolicy: 'none'
*/

// =============================================================================
// OPTIONS TYPE DEFINITION
// =============================================================================

/**
 * RLS options for OrgTable.make
 */
export type RlsOptions = {
  /**
   * Controls automatic RLS policy generation.
   *
   * - 'standard' (default): Generates policy requiring exact organizationId match
   * - 'nullable': Generates policy allowing NULL or matching organizationId
   * - 'none': Skips automatic policy generation (for custom policies)
   */
  rlsPolicy?: "standard" | "nullable" | "none";
};
