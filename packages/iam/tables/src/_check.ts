import type {
  Account,
  ApiKey,
  DeviceCode,
  Invitation,
  Jwks,
  Member,
  OAuthAccessToken,
  OAuthClient,
  OAuthConsent,
  OAuthRefreshToken,
  OrganizationRole,
  Passkey,
  RateLimit,
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

export const _checkSelectAccount: typeof Account.Model.select.Encoded = {} as InferSelectModel<typeof tables.account>;

export const _checkInsertAccount: typeof Account.Model.insert.Encoded = {} as InferInsertModel<typeof tables.account>;

export const _apiKeySelect: typeof ApiKey.Model.select.Encoded = {} as InferSelectModel<typeof tables.apiKey>;

export const _checkInsertApiKey: typeof ApiKey.Model.insert.Encoded = {} as InferInsertModel<typeof tables.apiKey>;

export const _deviceCodesSelect: typeof DeviceCode.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.deviceCode
>;

export const _checkInsertDeviceCodes: typeof DeviceCode.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.deviceCode
>;

export const _invitationSelect: typeof Invitation.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.invitation
>;

export const _checkInsertInvitation: typeof Invitation.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.invitation
>;

export const _jwksSelect: typeof Jwks.Model.select.Encoded = {} as InferSelectModel<typeof tables.jwks>;
export const _checkInsertJwks: typeof Jwks.Model.insert.Encoded = {} as InferInsertModel<typeof tables.jwks>;

export const _memberSelect: typeof Member.Model.select.Encoded = {} as InferSelectModel<typeof tables.member>;

export const _checkInsertMember: typeof Member.Model.insert.Encoded = {} as InferInsertModel<typeof tables.member>;

export const _organizationRoleSelect: typeof OrganizationRole.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.organizationRole
>;

export const _checkInsertOrganizationRole: typeof OrganizationRole.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.organizationRole
>;

export const _passkeySelect: typeof Passkey.Model.select.Encoded = {} as InferSelectModel<typeof tables.passkey>;

export const _checkInsertPasskey: typeof Passkey.Model.insert.Encoded = {} as InferInsertModel<typeof tables.passkey>;

export const _rateLimitSelect: typeof RateLimit.Model.select.Encoded = {} as InferSelectModel<typeof tables.rateLimit>;

export const _checkInsertRateLimit: typeof RateLimit.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.rateLimit
>;

export const _ssoProviderSelect: typeof SsoProvider.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.ssoProvider
>;

export const _checkInsertSsoProvider: typeof SsoProvider.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.ssoProvider
>;

export const _subscriptionSelect: typeof Subscription.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.subscription
>;

export const _checkInsertSubscription: typeof Subscription.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.subscription
>;

export const _teamMemberSelect: typeof TeamMember.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.teamMember
>;

export const _checkInsertTeamMember: typeof TeamMember.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.teamMember
>;

export const _twoFactorSelect: typeof TwoFactor.Model.select.Encoded = {} as InferSelectModel<typeof tables.twoFactor>;

export const _checkInsertTwoFactor: typeof TwoFactor.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.twoFactor
>;

export const _userSelect: typeof User.Model.select.Encoded = {} as InferSelectModel<typeof tables.user>;

export const _checkInsertUser: typeof User.Model.insert.Encoded = {} as InferInsertModel<typeof tables.user>;

export const _verificationSelect: typeof Verification.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.verification
>;

export const _checkInsertVerification: typeof Verification.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.verification
>;

export const _walletAddressSelect: typeof WalletAddress.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.walletAddress
>;

export const _checkInsertWalletAddress: typeof WalletAddress.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.walletAddress
>;

// OAuth Client
export const _oauthClientSelect: typeof OAuthClient.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthClient
>;

export const _checkInsertOAuthClient: typeof OAuthClient.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthClient
>;

// OAuth Access Token
export const _oauthAccessTokenSelect: typeof OAuthAccessToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthAccessToken
>;

export const _checkInsertOAuthAccessToken: typeof OAuthAccessToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthAccessToken
>;

// OAuth Refresh Token
export const _oauthRefreshTokenSelect: typeof OAuthRefreshToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthRefreshToken
>;

export const _checkInsertOAuthRefreshToken: typeof OAuthRefreshToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthRefreshToken
>;

// OAuth Consent
export const _oauthConsentSelect: typeof OAuthConsent.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthConsent
>;

export const _checkInsertOAuthConsent: typeof OAuthConsent.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthConsent
>;
