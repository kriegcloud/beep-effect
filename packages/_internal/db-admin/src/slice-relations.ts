/* Calendar */
export { calendarEventRelations } from "@beep/calendar-tables/relations";
export {} from "@beep/comms-tables/relations";
export { userHotkeyRelations } from "@beep/customization-tables/relations";
/* Workspaces */
export {
  workspaceCommentRelations,
  workspaceDiscussionRelations,
  workspaceFileRelations,
  workspacePageRelations,
  workspaceSnapshotRelations,
  workspaceSourceLinkRelations,
} from "@beep/workspaces-tables/relations";
/* Iam */
export {
  accountRelations,
  apiKeyRelations,
  deviceCodeRelations,
  invitationRelations,
  memberRelations,
  oauthAccessTokenRelations,
  oauthClientRelations,
  oauthConsentRelations,
  oauthRefreshTokenRelations,
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
/* Knowledge */
export {
  embeddingRelations,
  entityRelations,
  extractionRelations,
  mentionRelations,
  ontologyRelations,
  relationRelations,
} from "@beep/knowledge-tables/relations";
