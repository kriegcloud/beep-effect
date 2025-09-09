import { BS } from "@beep/schema";
import * as S from "effect/Schema";
//----------------------------------------------------------------------------------------------------------------------
// IAM ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------

export const AccountIdKit = new BS.EntityIdKit({
  tableName: "account",
  brand: "AccountId",
  annotations: {
    description: "A unique identifier for an account",
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/AccountId"),
  },
});

export class AccountId extends AccountIdKit.Schema {
  static readonly tableName = AccountIdKit.tableName;
  static readonly create = AccountIdKit.create;
  static readonly make = AccountIdKit.make;
  static readonly is = AccountIdKit.is;
}

export namespace AccountId {
  export type Type = typeof AccountId.Type;
  export type Encoded = typeof AccountId.Encoded;
}

export const ApiKeyKit = new BS.EntityIdKit({
  tableName: "apikey",
  brand: "ApiKey",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/ApiKey"),
    description: "A unique identifier for an api key",
  },
});

export class ApiKeyId extends ApiKeyKit.Schema {
  static readonly tableName = ApiKeyKit.tableName;
  static readonly create = ApiKeyKit.create;
  static readonly make = ApiKeyKit.make;
  static readonly is = ApiKeyKit.is;
}

export namespace ApiKeyId {
  export type Type = typeof ApiKeyId.Type;
  export type Encoded = typeof ApiKeyId.Encoded;
}

export const InvitationIdKit = new BS.EntityIdKit({
  tableName: "invitation",
  brand: "InvitationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/InvitationId"),
    description: "A unique identifier for an invitation",
  },
});

export class InvitationId extends InvitationIdKit.Schema {
  static readonly tableName = InvitationIdKit.tableName;
  static readonly create = InvitationIdKit.create;
  static readonly make = InvitationIdKit.make;
  static readonly is = InvitationIdKit.is;
}

export namespace InvitationId {
  export type Type = typeof InvitationId.Type;
  export type Encoded = typeof InvitationId.Encoded;
}

export const JwksIdKit = new BS.EntityIdKit({
  tableName: "jwks",
  brand: "JwksId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/JwksId"),
    description: "A unique identifier for a jwks",
  },
});

export class JwksId extends JwksIdKit.Schema {
  static readonly tableName = JwksIdKit.tableName;
  static readonly create = JwksIdKit.create;
  static readonly make = JwksIdKit.make;
  static readonly is = JwksIdKit.is;
}

export namespace JwksId {
  export type Type = typeof JwksId.Type;
  export type Encoded = typeof JwksId.Encoded;
}

export const MemberIdKit = new BS.EntityIdKit({
  tableName: "member",
  brand: "MemberId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/MemberId"),
    description: "A unique identifier for a member",
  },
});

export class MemberId extends MemberIdKit.Schema {
  static readonly tableName = MemberIdKit.tableName;
  static readonly create = MemberIdKit.create;
  static readonly make = MemberIdKit.make;
  static readonly is = MemberIdKit.is;
}

export namespace MemberId {
  export type Type = typeof MemberId.Type;
  export type Encoded = typeof MemberId.Encoded;
}

export const OAuthAccessTokenIdKit = new BS.EntityIdKit({
  tableName: "oauth_access_token",
  brand: "OAuthAccessTokenId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthAccessTokenId"),
    description: "A unique identifier for an oauth access token",
  },
});

export class OAuthAccessTokenId extends OAuthAccessTokenIdKit.Schema {
  static readonly tableName = OAuthAccessTokenIdKit.tableName;
  static readonly create = OAuthAccessTokenIdKit.create;
  static readonly make = OAuthAccessTokenIdKit.make;
  static readonly is = OAuthAccessTokenIdKit.is;
}

export namespace OAuthAccessTokenId {
  export type Type = typeof OAuthAccessTokenId.Type;
  export type Encoded = typeof OAuthAccessTokenId.Encoded;
}

export const OAuthApplicationIdKit = new BS.EntityIdKit({
  tableName: "oauth_application",
  brand: "OAuthApplicationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthApplicationId"),
    description: "A unique identifier for an oauth application",
  },
});

export class OAuthApplicationId extends OAuthApplicationIdKit.Schema {
  static readonly tableName = OAuthApplicationIdKit.tableName;
  static readonly create = OAuthApplicationIdKit.create;
  static readonly make = OAuthApplicationIdKit.make;
  static readonly is = OAuthApplicationIdKit.is;
}

export namespace OAuthApplicationId {
  export type Type = typeof OAuthApplicationId.Type;
  export type Encoded = typeof OAuthApplicationId.Encoded;
}

export const OAuthConsentIdKit = new BS.EntityIdKit({
  tableName: "oauth_consent",
  brand: "OAuthConsentId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthConsentId"),
    description: "A unique identifier for an oauth consent",
  },
});

export class OAuthConsentId extends OAuthConsentIdKit.Schema {
  static readonly tableName = OAuthConsentIdKit.tableName;
  static readonly create = OAuthConsentIdKit.create;
  static readonly make = OAuthConsentIdKit.make;
  static readonly is = OAuthConsentIdKit.is;
}

export namespace OAuthConsentId {
  export type Type = typeof OAuthConsentId.Type;
  export type Encoded = typeof OAuthConsentId.Encoded;
}

export const PasskeyIdKit = new BS.EntityIdKit({
  tableName: "passkey",
  brand: "Passkey",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/PasskeyId"),
    description: "A unique identifier for a passkey",
  },
});

export class PasskeyId extends PasskeyIdKit.Schema {
  static readonly tableName = PasskeyIdKit.tableName;
  static readonly create = PasskeyIdKit.create;
  static readonly make = PasskeyIdKit.make;
  static readonly is = PasskeyIdKit.is;
}

export namespace PasskeyId {
  export type Type = typeof PasskeyId.Type;
  export type Encoded = typeof PasskeyId.Encoded;
}

export const RateLimitIdKit = new BS.EntityIdKit({
  tableName: "rate_limit",
  brand: "RateLimitId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/RateLimitId"),
    description: "A unique identifier for a rate limit",
  },
});

export class RateLimitId extends RateLimitIdKit.Schema {
  static readonly tableName = RateLimitIdKit.tableName;
  static readonly create = RateLimitIdKit.create;
  static readonly make = RateLimitIdKit.make;
  static readonly is = RateLimitIdKit.is;
}

export namespace RateLimitId {
  export type Type = typeof RateLimitId.Type;
  export type Encoded = typeof RateLimitId.Encoded;
}

export const SessionIdKit = new BS.EntityIdKit({
  tableName: "session",
  brand: "SessionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SessionId"),
    description: "A unique identifier for a session",
  },
});

export class SessionId extends SessionIdKit.Schema {
  static readonly tableName = SessionIdKit.tableName;
  static readonly create = SessionIdKit.create;
  static readonly make = SessionIdKit.make;
  static readonly is = SessionIdKit.is;
}

export namespace SessionId {
  export type Type = typeof SessionId.Type;
  export type Encoded = typeof SessionId.Encoded;
}

export const SsoProviderIdKit = new BS.EntityIdKit({
  tableName: "sso_provider",
  brand: "SsoProviderId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SsoProviderId"),
    description: "A unique identifier for an sso provider",
  },
});

export class SsoProviderId extends SsoProviderIdKit.Schema {
  static readonly tableName = SsoProviderIdKit.tableName;
  static readonly create = SsoProviderIdKit.create;
  static readonly make = SsoProviderIdKit.make;
  static readonly is = SsoProviderIdKit.is;
}

export namespace SsoProviderId {
  export type Type = typeof SsoProviderId.Type;
  export type Encoded = typeof SsoProviderId.Encoded;
}

export const SubscriptionIdKit = new BS.EntityIdKit({
  tableName: "subscription",
  brand: "SubscriptionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SubscriptionId"),
    description: "A unique identifier for a subscription",
  },
});

export class SubscriptionId extends SubscriptionIdKit.Schema {
  static readonly tableName = SubscriptionIdKit.tableName;
  static readonly create = SubscriptionIdKit.create;
  static readonly make = SubscriptionIdKit.make;
  static readonly is = SubscriptionIdKit.is;
}

export namespace SubscriptionId {
  export type Type = typeof SubscriptionId.Type;
  export type Encoded = typeof SubscriptionId.Encoded;
}

export const TeamMemberIdKit = new BS.EntityIdKit({
  tableName: "team_member",
  brand: "TeamMemberId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/TeamMemberId"),
    description: "A unique identifier for a team member",
  },
});

export class TeamMemberId extends TeamMemberIdKit.Schema {
  static readonly tableName = TeamMemberIdKit.tableName;
  static readonly create = TeamMemberIdKit.create;
  static readonly make = TeamMemberIdKit.make;
  static readonly is = TeamMemberIdKit.is;
}

export namespace TeamMemberId {
  export type Type = typeof TeamMemberId.Type;
  export type Encoded = typeof TeamMemberId.Encoded;
}

export const TwoFactorIdKit = new BS.EntityIdKit({
  tableName: "two_factor",
  brand: "TwoFactorId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/TwoFactorId"),
    description: "A unique identifier for a two factor",
  },
});

export class TwoFactorId extends TwoFactorIdKit.Schema {
  static readonly tableName = TwoFactorIdKit.tableName;
  static readonly create = TwoFactorIdKit.create;
  static readonly make = TwoFactorIdKit.make;
  static readonly is = TwoFactorIdKit.is;
}

export namespace TwoFactorId {
  export type Type = typeof TwoFactorId.Type;
  export type Encoded = typeof TwoFactorId.Encoded;
}

export const UserIdKit = new BS.EntityIdKit({
  tableName: "user",
  brand: "UserId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/UserId"),
    description: "A unique identifier for a user",
  },
});

export class UserId extends UserIdKit.Schema {
  static readonly tableName = UserIdKit.tableName;
  static readonly create = UserIdKit.create;
  static readonly make = UserIdKit.make;
  static readonly is = UserIdKit.is;
}

export namespace UserId {
  export type Type = typeof UserId.Type;
  export type Encoded = typeof UserId.Encoded;
}

export const VerificationIdKit = new BS.EntityIdKit({
  tableName: "verification",
  brand: "VerificationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/VerificationId"),
    description: "A unique identifier for a verification",
  },
});

export class VerificationId extends VerificationIdKit.Schema {
  static readonly tableName = VerificationIdKit.tableName;
  static readonly create = VerificationIdKit.create;
  static readonly make = VerificationIdKit.make;
  static readonly is = VerificationIdKit.is;
}

export namespace VerificationId {
  export type Type = typeof VerificationId.Type;
  export type Encoded = typeof VerificationId.Encoded;
}

export const WalletAddressIdKit = new BS.EntityIdKit({
  tableName: "wallet_address",
  brand: "WalletAddressId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/WalletAddressId"),
    description: "A unique identifier for a wallet address",
  },
});

export class WalletAddressId extends WalletAddressIdKit.Schema {
  static readonly tableName = WalletAddressIdKit.tableName;
  static readonly create = WalletAddressIdKit.create;
  static readonly make = WalletAddressIdKit.make;
  static readonly is = WalletAddressIdKit.is;
}

export namespace WalletAddressId {
  export type Type = typeof WalletAddressId.Type;
  export type Encoded = typeof WalletAddressId.Encoded;
}

export const OrganizationRoleIdKit = new BS.EntityIdKit({
  tableName: "organization_role",
  brand: "OrganizationRoleId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OrganizationRoleId"),
    description: "A unique identifier for an organization role",
  },
});

export class OrganizationRoleId extends OrganizationRoleIdKit.Schema {
  static readonly tableName = OrganizationRoleIdKit.tableName;
  static readonly create = OrganizationRoleIdKit.create;
  static readonly make = OrganizationRoleIdKit.make;
  static readonly is = OrganizationRoleIdKit.is;
}

export namespace OrganizationRoleId {
  export type Type = typeof OrganizationRoleId.Type;
  export type Encoded = typeof OrganizationRoleId.Encoded;
}

export class IamEntityId extends S.Union(
  AccountId,
  ApiKeyId,
  InvitationId,
  JwksId,
  MemberId,
  OAuthAccessTokenId,
  OAuthApplicationId,
  OAuthConsentId,
  PasskeyId,
  RateLimitId,
  SessionId,
  SsoProviderId,
  SubscriptionId,
  TeamMemberId,
  TwoFactorId,
  UserId,
  VerificationId,
  WalletAddressId,
  OrganizationRoleId
) {}

export namespace IamEntityId {
  export type Type = typeof IamEntityId.Type;
  export type Encoded = typeof IamEntityId.Encoded;
}
