import * as Relations from "./relations";
import * as Tables from "./tables";

export const Schema = {
  // account
  accountRelations: Relations.accountRelations,
  account: Tables.account,

  // apiKey
  apiKeyRelations: Relations.apiKeyRelations,
  apiKey: Tables.apiKey,

  // deviceCodes:
  deviceCode: Tables.deviceCode,
  deviceCodeStatusPgEnum: Tables.deviceCodeStatusPgEnum,
  deviceCodeRelations: Relations.deviceCodeRelations,

  // inivitation:
  invitation: Tables.invitation,
  invitationStatusEnum: Tables.invitationStatusEnum,
  invitationRelations: Relations.invitationRelations,

  // jwks
  jwks: Tables.jwks,

  // member
  memberRelations: Relations.memberRelations,
  member: Tables.member,
  memberRoleEnum: Tables.memberRoleEnum,
  memberStatusEnum: Tables.memberStatusEnum,

  // oauthAccessToken
  oauthAccessToken: Tables.oauthAccessToken,
  oauthAccessTokenRelations: Relations.oauthAccessTokenRelations,

  // oauthApplication
  oauthApplication: Tables.oauthApplication,
  oauthApplicationRelations: Relations.oauthApplicationRelations,

  // oauthConsent
  oauthConsent: Tables.oauthConsent,
  oauthConsentRelations: Relations.oauthConsentRelations,

  // organization:
  organization: Tables.organization,
  organizationTypePgEnum: Tables.organizationTypePgEnum,
  organizationRelations: Relations.organizationRelations,

  // organizationRole
  organizationRole: Tables.organizationRole,
  organizationRoleRelations: Relations.organizationRoleRelations,

  // passkey
  passkey: Tables.passkey,
  passkeyRelations: Relations.passkeyRelations,

  // rateLimit
  rateLimit: Tables.rateLimit,

  // scimProvider
  scimProvider: Tables.scimProvider,
  scimProviderRelations: Relations.scimProviderRelations,

  // ssoProvider
  ssoProvider: Tables.ssoProvider,
  ssoProviderRelations: Relations.ssoProviderRelations,

  // subscription
  subscription: Tables.subscription,
  subscriptionRelations: Relations.subscriptionRelations,

  // session
  session: Tables.session,
  sessionRelations: Relations.sessionRelations,

  // team
  team: Tables.team,
  teamRelations: Relations.teamRelations,

  // teamMember
  teamMember: Tables.teamMember,
  teamMemberRelations: Relations.teamMemberRelations,

  // twoFactor
  twoFactor: Tables.twoFactor,
  twoFactorRelations: Relations.twoFactorRelations,

  // user
  user: Tables.user,
  userRelations: Relations.userRelations,
  userRolePgEnum: Tables.userRolePgEnum,

  // file
  file: Tables.file,

  // verification
  verification: Tables.verification,

  // walletAddress
  walletAddress: Tables.walletAddress,
  walletAddressRelations: Relations.walletAddressRelations,
};

export declare namespace Schema {
  export type Type = typeof Schema;
}
