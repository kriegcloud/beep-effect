import { organization, team, user } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";
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
  session,
  ssoProvider,
  subscription,
  teamMember,
  twoFactor,
  walletAddress,
} from "./tables";

export const memberRelations = d.relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
    relationName: "memberUser",
  }),
  invitedByUser: one(user, {
    fields: [member.invitedBy],
    references: [user.id],
    relationName: "invitedByUser",
  }),
}));

export const deviceCodeRelations = d.relations(deviceCode, ({ one }) => ({
  user: one(user, {
    fields: [deviceCode.userId],
    references: [user.id],
  }),
}));

export const subscriptionRelations = d.relations(subscription, ({ one }) => ({
  organization: one(organization, {
    fields: [subscription.organizationId],
    references: [organization.id],
  }),
}));

export const teamRelations = d.relations(team, ({ one, many }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
  members: many(teamMember),
}));

export const teamMemberRelations = d.relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}));

export const oauthAccessTokenRelations = d.relations(oauthAccessToken, ({ one }) => ({
  user: one(user, {
    fields: [oauthAccessToken.userId],
    references: [user.id],
  }),
}));

export const oauthApplicationRelations = d.relations(oauthApplication, ({ one }) => ({
  user: one(user, {
    fields: [oauthApplication.userId],
    references: [user.id],
  }),
}));

export const oauthConsentRelations = d.relations(oauthConsent, ({ one }) => ({
  user: one(user, {
    fields: [oauthConsent.userId],
    references: [user.id],
  }),
}));

export const ssoProviderRelations = d.relations(ssoProvider, ({ one }) => ({
  user: one(user, {
    fields: [ssoProvider.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [ssoProvider.organizationId],
    references: [organization.id],
  }),
}));

export const accountRelations = d.relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const apiKeyRelations = d.relations(apiKey, ({ one }) => ({
  user: one(user, {
    fields: [apiKey.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = d.relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const passkeyRelations = d.relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = d.relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
    relationName: "sessions",
  }),
  activeOrganization: one(organization, {
    fields: [session.activeOrganizationId],
    references: [organization.id],
  }),
  impersonator: one(user, {
    fields: [session.impersonatedBy],
    references: [user.id],
    relationName: "impersonatedSessions",
  }),
}));

export const twoFactorRelations = d.relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const userRelations = d.relations(user, ({ many }) => ({
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
}));

export const organizationRelations = d.relations(organization, ({ many, one }) => ({
  // Ownership
  owner: one(user, {
    fields: [organization.ownerUserId],
    references: [user.id],
  }),

  // Core organizational structure
  members: many(member),
  teams: many(team),
  subscriptions: many(subscription),
}));

export const walletAddressRelations = d.relations(walletAddress, ({ one }) => ({
  user: one(user, {
    fields: [walletAddress.userId],
    references: [user.id],
    relationName: "wallets",
  }),
}));

export const organizationRoleRelations = d.relations(organizationRole, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationRole.organizationId],
    references: [organization.id],
  }),
}));
