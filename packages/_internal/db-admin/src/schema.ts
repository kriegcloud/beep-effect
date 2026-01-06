/**
 * Unified schema for db-admin that exports all tables and merged relations.
 *
 * This is used for:
 * - Drizzle migrations (drizzle-kit)
 * - Database admin tools
 * - Seeding scripts
 *
 * Individual slices should NOT import from here - they should use their own
 * slice-scoped schemas for proper type inference and vertical slice isolation.
 */

export * from "@beep/customization-tables/tables";
export * from "@beep/documents-tables/tables";
export * from "@beep/iam-tables/tables";
export * from "@beep/shared-tables/columns/bytea";
export * from "@beep/shared-tables/columns/custom-datetime";
// =============================================================================
// Tables - export all tables from each slice
// =============================================================================
export * from "@beep/shared-tables/tables";
// =============================================================================
// Unified relations for shared tables (user, organization, team)
// These merge relations from all slices to avoid Drizzle warnings
// =============================================================================
export * from "./relations";

// =============================================================================
// Slice-specific relations (non-conflicting)
// =============================================================================

export { userHotkeyRelations } from "@beep/customization-tables/relations";
// Documents slice relations (excluding documentsUserRelations, documentsOrganizationRelations, documentsTeamRelations)
export {
  commentRelations,
  discussionRelations,
  documentFileRelations,
  documentRelations,
  documentVersionRelations,
} from "@beep/documents-tables/relations";
// IAM slice relations (excluding userRelations, organizationRelations, teamRelations)
export {
  accountRelations,
  apiKeyRelations,
  deviceCodeRelations,
  invitationRelations,
  memberRelations,
  oauthAccessTokenRelations,
  oauthApplicationRelations,
  oauthConsentRelations,
  organizationRoleRelations,
  passkeyRelations,
  scimProviderRelations,
  sessionRelations,
  ssoProviderRelations,
  subscriptionRelations,
  teamMemberRelations,
  twoFactorRelations,
  walletAddressRelations,
} from "@beep/iam-tables/relations";
