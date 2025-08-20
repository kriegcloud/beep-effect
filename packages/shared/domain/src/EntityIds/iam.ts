import { BS } from "@beep/schema";
//----------------------------------------------------------------------------------------------------------------------
// IAM ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------
export const AccountId = BS.EntityId.make("AccountId")({
  identifier: "AccountId",
  description: "A unique identifier for an account",
  title: "Account Id",
});
export namespace AccountId {
  export type Type = typeof AccountId.Type;
  export type Encoded = typeof AccountId.Encoded;
}

export const ApiKeyId = BS.EntityId.make("ApiKey")({
  identifier: "ApiKey",
  description: "A unique identifier for an api key",
  title: "Api Key",
});

export namespace ApiKeyId {
  export type Type = typeof ApiKeyId.Type;
  export type Encoded = typeof ApiKeyId.Encoded;
}

export const InvitationId = BS.EntityId.make("Invitation")({
  identifier: "Invitation",
  description: "A unique identifier for an invitation",
  title: "Invitation",
});

export namespace InvitationId {
  export type Type = typeof InvitationId.Type;
  export type Encoded = typeof InvitationId.Encoded;
}

export const JwksId = BS.EntityId.make("Jwks")({
  identifier: "Jwks",
  description: "A unique identifier for a jwks",
  title: "Jwks",
});

export namespace JwksId {
  export type Type = typeof JwksId.Type;
  export type Encoded = typeof JwksId.Encoded;
}

export const MemberId = BS.EntityId.make("Member")({
  identifier: "Member",
  description: "A unique identifier for a member",
  title: "Member",
});

export namespace MemberId {
  export type Type = typeof MemberId.Type;
  export type Encoded = typeof MemberId.Encoded;
}

export const OAuthAccessTokenId = BS.EntityId.make("OAuthAccessToken")({
  identifier: "OAuthAccessToken",
  description: "A unique identifier for an oauth access token",
  title: "OAuth Access Token",
});

export namespace OAuthAccessTokenId {
  export type Type = typeof OAuthAccessTokenId.Type;
  export type Encoded = typeof OAuthAccessTokenId.Encoded;
}

export const OAuthApplicationId = BS.EntityId.make("OAuthApplication")({
  identifier: "OAuthApplication",
  description: "A unique identifier for an oauth application",
  title: "OAuth Application",
});

export namespace OAuthApplicationId {
  export type Type = typeof OAuthApplicationId.Type;
  export type Encoded = typeof OAuthApplicationId.Encoded;
}

export const OAuthConsentId = BS.EntityId.make("OAuthConsent")({
  identifier: "OAuthConsent",
  description: "A unique identifier for an oauth consent",
  title: "OAuth Consent",
});

export namespace OAuthConsentId {
  export type Type = typeof OAuthConsentId.Type;
  export type Encoded = typeof OAuthConsentId.Encoded;
}

export const PasskeyId = BS.EntityId.make("Passkey")({
  identifier: "Passkey",
  description: "A unique identifier for a passkey",
  title: "Passkey",
});

export namespace PasskeyId {
  export type Type = typeof PasskeyId.Type;
  export type Encoded = typeof PasskeyId.Encoded;
}

export const RateLimitId = BS.EntityId.make("RateLimit")({
  identifier: "RateLimit",
  description: "A unique identifier for a rate limit",
  title: "Rate Limit",
});

export namespace RateLimitId {
  export type Type = typeof RateLimitId.Type;
  export type Encoded = typeof RateLimitId.Encoded;
}

export const SessionId = BS.EntityId.make("Session")({
  identifier: "Session",
  description: "A unique identifier for a session",
  title: "Session",
});

export namespace SessionId {
  export type Type = typeof SessionId.Type;
  export type Encoded = typeof SessionId.Encoded;
}

export const SsoProviderId = BS.EntityId.make("SsoProvider")({
  identifier: "SsoProvider",
  description: "A unique identifier for an sso provider",
  title: "Sso Provider",
});

export namespace SsoProviderId {
  export type Type = typeof SsoProviderId.Type;
  export type Encoded = typeof SsoProviderId.Encoded;
}

export const SubscriptionId = BS.EntityId.make("Subscription")({
  identifier: "Subscription",
  description: "A unique identifier for a subscription",
  title: "Subscription",
});

export namespace SubscriptionId {
  export type Type = typeof SubscriptionId.Type;
  export type Encoded = typeof SubscriptionId.Encoded;
}

export const TeamMemberId = BS.EntityId.make("TeamMember")({
  identifier: "TeamMember",
  description: "A unique identifier for a team member",
  title: "Team Member",
});

export namespace TeamMemberId {
  export type Type = typeof TeamMemberId.Type;
  export type Encoded = typeof TeamMemberId.Encoded;
}

export const TwoFactorId = BS.EntityId.make("TwoFactor")({
  identifier: "TwoFactor",
  description: "A unique identifier for a two factor",
  title: "Two Factor",
});

export namespace TwoFactorId {
  export type Type = typeof TwoFactorId.Type;
  export type Encoded = typeof TwoFactorId.Encoded;
}

export const UserId = BS.EntityId.make("User")({
  identifier: "User",
  description: "A unique identifier for a user",
  title: "User",
});

export namespace UserId {
  export type Type = typeof UserId.Type;
  export type Encoded = typeof UserId.Encoded;
}

export const VerificationId = BS.EntityId.make("Verification")({
  identifier: "Verification",
  description: "A unique identifier for a verification",
  title: "Verification",
});

export namespace VerificationId {
  export type Type = typeof VerificationId.Type;
  export type Encoded = typeof VerificationId.Encoded;
}

export const WalletAddressId = BS.EntityId.make("WalletAddress")({
  identifier: "WalletAddress",
  description: "A unique identifier for a wallet address",
  title: "Wallet Address",
});

export namespace WalletAddressId {
  export type Type = typeof WalletAddressId.Type;
  export type Encoded = typeof WalletAddressId.Encoded;
}
