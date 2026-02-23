import { organization, team, user } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";
import {
  account,
  apiKey,
  deviceCode,
  invitation,
  member,
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
  organizationRole,
  passkey,
  scimProvider,
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
  invitations: many(invitation),
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
  organization: one(organization, {
    fields: [teamMember.organizationId],
    references: [organization.id],
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
    relationName: "accounts",
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const apiKeyRelations = d.relations(apiKey, ({ one }) => ({
  user: one(user, {
    fields: [apiKey.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [apiKey.organizationId],
    references: [organization.id],
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
  team: one(team, {
    fields: [invitation.teamId],
    references: [team.id],
  }),
}));

export const passkeyRelations = d.relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
    relationName: "passkeys",
  }),
}));

export const sessionRelations = d.relations(session, ({ one, many }) => ({
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
  // OAuth relations
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
}));

export const twoFactorRelations = d.relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [twoFactor.organizationId],
    references: [organization.id],
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

  impersonatedSessions: many(session, {
    relationName: "impersonatedSessions",
  }),
  // Additional relations
  twoFactors: many(twoFactor),
  deviceCodes: many(deviceCode),

  ssoProviders: many(ssoProvider),
  invitations: many(invitation),

  apiKeys: many(apiKey),

  // OAuth relations
  oauthClients: many(oauthClient),
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
  oauthConsents: many(oauthConsent),
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

  // Additional relations
  twoFactors: many(twoFactor),
  organizationRoles: many(organizationRole),
  ssoProviders: many(ssoProvider),

  invitations: many(invitation),

  apiKeys: many(apiKey),
  teamMembers: many(teamMember),
  scimProviders: many(scimProvider),
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

export const scimProviderRelations = d.relations(scimProvider, ({ one }) => ({
  organization: one(organization, {
    fields: [scimProvider.organizationId],
    references: [organization.id],
  }),
}));

export const oauthClientRelations = d.relations(oauthClient, ({ one, many }) => ({
  user: one(user, {
    fields: [oauthClient.userId],
    references: [user.id],
  }),
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
  oauthConsents: many(oauthConsent),
}));

export const oauthRefreshTokenRelations = d.relations(oauthRefreshToken, ({ one, many }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthRefreshToken.clientId],
    references: [oauthClient.clientId],
  }),
  session: one(session, {
    fields: [oauthRefreshToken.sessionId],
    references: [session.id],
  }),
  user: one(user, {
    fields: [oauthRefreshToken.userId],
    references: [user.id],
  }),
  oauthAccessTokens: many(oauthAccessToken),
}));

export const oauthAccessTokenRelations = d.relations(oauthAccessToken, ({ one }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthAccessToken.clientId],
    references: [oauthClient.clientId],
  }),
  session: one(session, {
    fields: [oauthAccessToken.sessionId],
    references: [session.id],
  }),
  user: one(user, {
    fields: [oauthAccessToken.userId],
    references: [user.id],
  }),
  oauthRefreshToken: one(oauthRefreshToken, {
    fields: [oauthAccessToken.refreshId],
    references: [oauthRefreshToken.id],
  }),
}));

export const oauthConsentRelations = d.relations(oauthConsent, ({ one }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthConsent.clientId],
    references: [oauthClient.clientId],
  }),
  user: one(user, {
    fields: [oauthConsent.userId],
    references: [user.id],
  }),
}));
