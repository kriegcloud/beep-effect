import { organizationTable, teamTable, userTable } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";
import {
  accountTable,
  apiKeyTable,
  deviceCodeTable,
  invitationTable,
  memberTable,
  oauthAccessTokenTable,
  oauthApplicationTable,
  oauthConsentTable,
  organizationRoleTable,
  passkeyTable,
  sessionTable,
  ssoProviderTable,
  subscriptionTable,
  teamMemberTable,
  twoFactorTable,
  walletAddressTable,
} from "./tables";

export const memberRelations = d.relations(memberTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [memberTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [memberTable.userId],
    references: [userTable.id],
    relationName: "memberUser",
  }),
  invitedByUser: one(userTable, {
    fields: [memberTable.invitedBy],
    references: [userTable.id],
    relationName: "invitedByUser",
  }),
}));

export const deviceCodeRelations = d.relations(deviceCodeTable, ({ one }) => ({
  user: one(userTable, {
    fields: [deviceCodeTable.userId],
    references: [userTable.id],
  }),
}));

export const subscriptionRelations = d.relations(subscriptionTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [subscriptionTable.organizationId],
    references: [organizationTable.id],
  }),
}));

export const teamRelations = d.relations(teamTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [teamTable.organizationId],
    references: [organizationTable.id],
  }),
  members: many(teamMemberTable),
}));

export const teamMemberRelations = d.relations(teamMemberTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamMemberTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [teamMemberTable.userId],
    references: [userTable.id],
  }),
}));

export const oauthAccessTokenRelations = d.relations(oauthAccessTokenTable, ({ one }) => ({
  user: one(userTable, {
    fields: [oauthAccessTokenTable.userId],
    references: [userTable.id],
  }),
}));

export const oauthApplicationRelations = d.relations(oauthApplicationTable, ({ one }) => ({
  user: one(userTable, {
    fields: [oauthApplicationTable.userId],
    references: [userTable.id],
  }),
}));

export const oauthConsentRelations = d.relations(oauthConsentTable, ({ one }) => ({
  user: one(userTable, {
    fields: [oauthConsentTable.userId],
    references: [userTable.id],
  }),
}));

export const ssoProviderRelations = d.relations(ssoProviderTable, ({ one }) => ({
  user: one(userTable, {
    fields: [ssoProviderTable.userId],
    references: [userTable.id],
  }),
  organization: one(organizationTable, {
    fields: [ssoProviderTable.organizationId],
    references: [organizationTable.id],
  }),
}));

export const accountRelations = d.relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

export const apiKeyRelations = d.relations(apiKeyTable, ({ one }) => ({
  user: one(userTable, {
    fields: [apiKeyTable.userId],
    references: [userTable.id],
  }),
}));

export const invitationRelations = d.relations(invitationTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [invitationTable.organizationId],
    references: [organizationTable.id],
  }),
  inviter: one(userTable, {
    fields: [invitationTable.inviterId],
    references: [userTable.id],
  }),
}));

export const passkeyRelations = d.relations(passkeyTable, ({ one }) => ({
  user: one(userTable, {
    fields: [passkeyTable.userId],
    references: [userTable.id],
  }),
}));

export const sessionRelations = d.relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
  activeOrganization: one(organizationTable, {
    fields: [sessionTable.activeOrganizationId],
    references: [organizationTable.id],
  }),
  impersonator: one(userTable, {
    fields: [sessionTable.impersonatedBy],
    references: [userTable.id],
  }),
}));

export const twoFactorRelations = d.relations(twoFactorTable, ({ one }) => ({
  user: one(userTable, {
    fields: [twoFactorTable.userId],
    references: [userTable.id],
  }),
}));

export const userRelations = d.relations(userTable, ({ many }) => ({
  // Organization-related relationships
  memberships: many(memberTable, {
    relationName: "memberUser",
  }),
  ownedOrganizations: many(organizationTable),
  teamMemberships: many(teamMemberTable),
  invitationsSent: many(memberTable, {
    relationName: "invitedByUser",
  }),
  wallets: many(walletAddressTable),
  // Authentication-related relationships
  accounts: many(accountTable),
  sessions: many(sessionTable),
  passkeys: many(passkeyTable),
  oauthApplications: many(oauthApplicationTable),
  impersonatedSessions: many(sessionTable, {
    relationName: "impersonatedSessions",
  }),
}));

export const organizationRelations = d.relations(organizationTable, ({ many, one }) => ({
  // Ownership
  owner: one(userTable, {
    fields: [organizationTable.ownerUserId],
    references: [userTable.id],
  }),

  // Core organizational structure
  members: many(memberTable),
  teams: many(teamTable),
  subscriptions: many(subscriptionTable),
}));

export const walletAddressRelations = d.relations(walletAddressTable, ({ one }) => ({
  user: one(userTable, {
    fields: [walletAddressTable.userId],
    references: [userTable.id],
  }),
}));

export const organizationRoleRelations = d.relations(organizationRoleTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [organizationRoleTable.organizationId],
    references: [organizationTable.id],
  }),
}));
