import { EntityIdKit } from "@beep/schema/EntityId";

export const AccountIdKit = new EntityIdKit({
  tableName: "account",
  brand: "AccountId",
  annotations: {
    description: "A unique identifier for an account",
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/AccountId"),
  },
});

export const ApiKeyKit = new EntityIdKit({
  tableName: "apikey",
  brand: "ApiKey",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/ApiKey"),
    description: "A unique identifier for an api key",
  },
});

export const InvitationIdKit = new EntityIdKit({
  tableName: "invitation",
  brand: "InvitationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/InvitationId"),
    description: "A unique identifier for an invitation",
  },
});

export const JwksIdKit = new EntityIdKit({
  tableName: "jwks",
  brand: "JwksId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/JwksId"),
    description: "A unique identifier for a jwks",
  },
});

export const MemberIdKit = new EntityIdKit({
  tableName: "member",
  brand: "MemberId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/MemberId"),
    description: "A unique identifier for a member",
  },
});

export const OAuthAccessTokenIdKit = new EntityIdKit({
  tableName: "oauth_access_token",
  brand: "OAuthAccessTokenId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthAccessTokenId"),
    description: "A unique identifier for an oauth access token",
  },
});

export const OAuthApplicationIdKit = new EntityIdKit({
  tableName: "oauth_application",
  brand: "OAuthApplicationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthApplicationId"),
    description: "A unique identifier for an oauth application",
  },
});

export const OAuthConsentIdKit = new EntityIdKit({
  tableName: "oauth_consent",
  brand: "OAuthConsentId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthConsentId"),
    description: "A unique identifier for an oauth consent",
  },
});

export const PasskeyIdKit = new EntityIdKit({
  tableName: "passkey",
  brand: "Passkey",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/PasskeyId"),
    description: "A unique identifier for a passkey",
  },
});

export const RateLimitIdKit = new EntityIdKit({
  tableName: "rate_limit",
  brand: "RateLimitId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/RateLimitId"),
    description: "A unique identifier for a rate limit",
  },
});

export const SessionIdKit = new EntityIdKit({
  tableName: "session",
  brand: "SessionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SessionId"),
    description: "A unique identifier for a session",
  },
});

export const SsoProviderIdKit = new EntityIdKit({
  tableName: "sso_provider",
  brand: "SsoProviderId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SsoProviderId"),
    description: "A unique identifier for an sso provider",
  },
});

export const SubscriptionIdKit = new EntityIdKit({
  tableName: "subscription",
  brand: "SubscriptionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SubscriptionId"),
    description: "A unique identifier for a subscription",
  },
});

export const TeamMemberIdKit = new EntityIdKit({
  tableName: "team_member",
  brand: "TeamMemberId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/TeamMemberId"),
    description: "A unique identifier for a team member",
  },
});

export const TwoFactorIdKit = new EntityIdKit({
  tableName: "two_factor",
  brand: "TwoFactorId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/TwoFactorId"),
    description: "A unique identifier for a two factor",
  },
});

export const UserIdKit = new EntityIdKit({
  tableName: "user",
  brand: "UserId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/UserId"),
    description: "A unique identifier for a user",
  },
});

export const VerificationIdKit = new EntityIdKit({
  tableName: "verification",
  brand: "VerificationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/VerificationId"),
    description: "A unique identifier for a verification",
  },
});

export const WalletAddressIdKit = new EntityIdKit({
  tableName: "wallet_address",
  brand: "WalletAddressId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/WalletAddressId"),
    description: "A unique identifier for a wallet address",
  },
});

export const OrganizationRoleIdKit = new EntityIdKit({
  tableName: "organization_role",
  brand: "OrganizationRoleId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OrganizationRoleId"),
    description: "A unique identifier for an organization role",
  },
});
