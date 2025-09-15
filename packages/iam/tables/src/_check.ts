import type {
  Account,
  ApiKey,
  DeviceCode,
  Invitation,
  Jwks,
  Member,
  OAuthAccessToken,
  OAuthApplication,
  OAuthConsent,
  OrganizationRole,
  Passkey,
  RateLimit,
  Session,
  SsoProvider,
  Subscription,
  TeamMember,
  TwoFactor,
  User,
  Verification,
  WalletAddress,
} from "@beep/iam-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type * as tables from "./schema";

export const _checkSelectAccount: typeof Account.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.accountTable
>;

export const _checkInsertAccount: typeof Account.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.accountTable
>;

export const _apiKeySelect: typeof ApiKey.Model.select.Encoded = {} as InferSelectModel<typeof tables.apiKeyTable>;

export const _checkInsertApiKey: typeof ApiKey.Model.insert.Encoded = {} as InferInsertModel<typeof tables.apiKeyTable>;

export const _deviceCodesSelect: typeof DeviceCode.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.deviceCodeTable
>;

export const _checkInsertDeviceCodes: typeof DeviceCode.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.deviceCodeTable
>;

export const _invitationSelect: typeof Invitation.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.invitationTable
>;

export const _checkInsertInvitation: typeof Invitation.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.invitationTable
>;

export const _jwksSelect: typeof Jwks.Model.select.Encoded = {} as InferSelectModel<typeof tables.jwksTable>;
export const _checkInsertJwks: typeof Jwks.Model.insert.Encoded = {} as InferInsertModel<typeof tables.jwksTable>;

export const _memberSelect: typeof Member.Model.select.Encoded = {} as InferSelectModel<typeof tables.memberTable>;

export const _checkInsertMember: typeof Member.Model.insert.Encoded = {} as InferInsertModel<typeof tables.memberTable>;

export const _oauthAccessToken: typeof OAuthAccessToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthAccessTokenTable
>;

export const _checkInsertOAuthAccessToken: typeof OAuthAccessToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthAccessTokenTable
>;

export const _oauthApplicationSelect: typeof OAuthApplication.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthApplicationTable
>;

export const _checkInsertOAuthApplication: typeof OAuthApplication.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthApplicationTable
>;

export const _oauthConsentSelect: typeof OAuthConsent.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthConsentTable
>;

export const _checkInsertOAuthConsent: typeof OAuthConsent.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthConsentTable
>;

export const _organizationRoleSelect: typeof OrganizationRole.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.organizationRoleTable
>;

export const _checkInsertOrganizationRole: typeof OrganizationRole.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.organizationRoleTable
>;

export const _passkeySelect: typeof Passkey.Model.select.Encoded = {} as InferSelectModel<typeof tables.passkeyTable>;

export const _checkInsertPasskey: typeof Passkey.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.passkeyTable
>;

export const _rateLimitSelect: typeof RateLimit.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.rateLimitTable
>;

export const _checkInsertRateLimit: typeof RateLimit.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.rateLimitTable
>;

export const _sessionSelect: typeof Session.Model.select.Encoded = {} as InferSelectModel<typeof tables.sessionTable>;

export const _checkInsertSession: typeof Session.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.sessionTable
>;

export const _ssoProviderSelect: typeof SsoProvider.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.ssoProviderTable
>;

export const _checkInsertSsoProvider: typeof SsoProvider.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.ssoProviderTable
>;

export const _subscriptionSelect: typeof Subscription.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.subscriptionTable
>;

export const _checkInsertSubscription: typeof Subscription.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.subscriptionTable
>;

export const _teamMemberSelect: typeof TeamMember.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.teamMemberTable
>;

export const _checkInsertTeamMember: typeof TeamMember.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.teamMemberTable
>;

export const _twoFactorSelect: typeof TwoFactor.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.twoFactorTable
>;

export const _checkInsertTwoFactor: typeof TwoFactor.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.twoFactorTable
>;

export const _userSelect: typeof User.Model.select.Encoded = {} as InferSelectModel<typeof tables.userTable>;

export const _checkInsertUser: typeof User.Model.insert.Encoded = {} as InferInsertModel<typeof tables.userTable>;

export const _verificationSelect: typeof Verification.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.verificationTable
>;

export const _checkInsertVerification: typeof Verification.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.verificationTable
>;

export const _walletAddressSelect: typeof WalletAddress.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.walletAddressTable
>;

export const _checkInsertWalletAddress: typeof WalletAddress.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.walletAddressTable
>;
