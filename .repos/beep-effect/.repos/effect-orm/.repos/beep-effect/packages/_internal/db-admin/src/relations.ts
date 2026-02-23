/**
 * Unified relations for db-admin that merges relations from all slices.
 *
 * Each slice defines its own relations for slice-specific tables, but shared tables
 * (user, organization, team) need unified relations that combine all slice perspectives.
 *
 * This file is used only by db-admin for migrations and admin tools.
 * Individual slices should continue using their own relations for type inference.
 */

// Import Documents tables
import { comment, discussion, document, documentFile, documentVersion } from "@beep/documents-tables/tables";
// Import IAM tables
import {
  account,
  apiKey,
  deviceCode,
  invitation,
  member,
  oauthAccessToken,
  oauthApplication,
  oauthConsent,
  organizationRole,
  passkey,
  scimProvider,
  session,
  ssoProvider,
  subscription,
  teamMember,
  twoFactor,
  walletAddress,
} from "@beep/iam-tables/tables";
// Import shared tables
import { organization, team, user } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";

// =============================================================================
// Unified User Relations (merges IAM + Documents)
// =============================================================================
export const userRelations = d.relations(user, ({ many }) => ({
  // === IAM slice relations ===
  // Organization-related relationships
  memberships: many(member, {
    relationName: "memberUser",
  }),
  ownedOrganizations: many(organization),
  teamMemberships: many(teamMember),
  sessions: many(session, {
    relationName: "sessions",
  }),
  invitationsSent: many(member, {
    relationName: "invitedByUser",
  }),
  wallets: many(walletAddress, {
    relationName: "wallets",
  }),
  // Authentication-related relationships
  accounts: many(account, {
    relationName: "accounts",
  }),
  passkeys: many(passkey, {
    relationName: "passkeys",
  }),
  oauthApplications: many(oauthApplication),
  impersonatedSessions: many(session, {
    relationName: "impersonatedSessions",
  }),
  // Additional IAM relations
  twoFactors: many(twoFactor),
  deviceCodes: many(deviceCode),
  oauthAccessTokens: many(oauthAccessToken),
  ssoProviders: many(ssoProvider),
  invitations: many(invitation),
  oauthConsents: many(oauthConsent),
  apiKeys: many(apiKey),

  // === Documents slice relations ===
  documents: many(document),
  documentVersions: many(documentVersion),
  documentFiles: many(documentFile),
  discussions: many(discussion),
  comments: many(comment),
}));

// =============================================================================
// Unified Organization Relations (merges IAM + Documents)
// =============================================================================
export const organizationRelations = d.relations(organization, ({ many, one }) => ({
  // === IAM slice relations ===
  // Ownership
  owner: one(user, {
    fields: [organization.ownerUserId],
    references: [user.id],
  }),
  // Core organizational structure
  members: many(member),
  teams: many(team),
  subscriptions: many(subscription),
  // Additional IAM relations
  twoFactors: many(twoFactor),
  oauthAccessTokens: many(oauthAccessToken),
  organizationRoles: many(organizationRole),
  ssoProviders: many(ssoProvider),
  oauthApplications: many(oauthApplication),
  invitations: many(invitation),
  oauthConsents: many(oauthConsent),
  apiKeys: many(apiKey),
  teamMembers: many(teamMember),
  scimProviders: many(scimProvider),

  // === Documents slice relations ===
  documents: many(document),
  documentVersions: many(documentVersion),
  documentFiles: many(documentFile),
  discussions: many(discussion),
  comments: many(comment),
}));

// =============================================================================
// Unified Team Relations (merges IAM + Documents)
// =============================================================================
export const teamRelations = d.relations(team, ({ one, many }) => ({
  // === IAM slice relations ===
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
  members: many(teamMember),
  invitations: many(invitation),
}));
