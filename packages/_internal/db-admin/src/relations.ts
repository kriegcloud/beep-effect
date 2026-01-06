/**
 * Unified relations for db-admin that merges relations from all slices.
 *
 * Each slice defines its own relations for slice-specific tables, but shared tables
 * (user, organization, team) need unified relations that combine all slice perspectives.
 *
 * This file is used only by db-admin for migrations and admin tools.
 * Individual slices should continue using their own relations for type inference.
 */

import * as d from "drizzle-orm";
import * as Tables from "./tables";

// =============================================================================
// Unified User Relations (merges IAM + Documents)
// =============================================================================
export const userRelations = d.relations(Tables.user, ({ many }) => ({
  // === IAM slice relations ===
  // Organization-related relationships
  memberships: many(Tables.member, {
    relationName: "memberUser",
  }),
  ownedOrganizations: many(Tables.organization),
  teamMemberships: many(Tables.teamMember),
  sessions: many(Tables.session, {
    relationName: "sessions",
  }),
  invitationsSent: many(Tables.member, {
    relationName: "invitedByUser",
  }),
  wallets: many(Tables.walletAddress, {
    relationName: "wallets",
  }),
  // Authentication-related relationships
  accounts: many(Tables.account, {
    relationName: "accounts",
  }),
  passkeys: many(Tables.passkey, {
    relationName: "passkeys",
  }),
  oauthApplications: many(Tables.oauthApplication),
  impersonatedSessions: many(Tables.session, {
    relationName: "impersonatedSessions",
  }),
  // Additional IAM relations
  twoFactors: many(Tables.twoFactor),
  deviceCodes: many(Tables.deviceCode),
  oauthAccessTokens: many(Tables.oauthAccessToken),
  ssoProviders: many(Tables.ssoProvider),
  invitations: many(Tables.invitation),
  oauthConsents: many(Tables.oauthConsent),
  apiKeys: many(Tables.apiKey),

  // === Documents slice relations ===
  documents: many(Tables.document),
  documentVersions: many(Tables.documentVersion),
  documentFiles: many(Tables.documentFile),
  discussions: many(Tables.discussion),
  comments: many(Tables.comment),
  hotkeys: many(Tables.userHotkey),
}));

// =============================================================================
// Unified Organization Relations (merges IAM + Documents)
// =============================================================================
export const organizationRelations = d.relations(Tables.organization, ({ many, one }) => ({
  // === IAM slice relations ===
  // Ownership
  owner: one(Tables.user, {
    fields: [Tables.organization.ownerUserId],
    references: [Tables.user.id],
  }),
  // Core organizational structure
  members: many(Tables.member),
  teams: many(Tables.team),
  subscriptions: many(Tables.subscription),
  // Additional IAM relations
  twoFactors: many(Tables.twoFactor),
  oauthAccessTokens: many(Tables.oauthAccessToken),
  organizationRoles: many(Tables.organizationRole),
  ssoProviders: many(Tables.ssoProvider),
  oauthApplications: many(Tables.oauthApplication),
  invitations: many(Tables.invitation),
  oauthConsents: many(Tables.oauthConsent),
  apiKeys: many(Tables.apiKey),
  teamMembers: many(Tables.teamMember),
  scimProviders: many(Tables.scimProvider),

  // === Documents slice relations ===
  documents: many(Tables.document),
  documentVersions: many(Tables.documentVersion),
  documentFiles: many(Tables.documentFile),
  discussions: many(Tables.discussion),
  comments: many(Tables.comment),
}));

// =============================================================================
// Unified Team Relations (merges IAM + Documents)
// =============================================================================
export const teamRelations = d.relations(Tables.team, ({ one, many }) => ({
  // === IAM slice relations ===
  organization: one(Tables.organization, {
    fields: [Tables.team.organizationId],
    references: [Tables.organization.id],
  }),
  members: many(Tables.teamMember),
  invitations: many(Tables.invitation),
}));
