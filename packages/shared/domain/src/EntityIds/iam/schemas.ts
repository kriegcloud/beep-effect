import type * as S from "effect/Schema";
import {
  AccountIdKit,
  ApiKeyKit,
  InvitationIdKit,
  JwksIdKit,
  MemberIdKit,
  OAuthAccessTokenIdKit,
  OAuthApplicationIdKit,
  OAuthConsentIdKit,
  OrganizationRoleIdKit,
  PasskeyIdKit,
  RateLimitIdKit,
  SessionIdKit,
  SsoProviderIdKit,
  SubscriptionIdKit,
  TeamMemberIdKit,
  TwoFactorIdKit,
  UserIdKit,
  VerificationIdKit,
  WalletAddressIdKit,
} from "./kits";

export class AccountId extends AccountIdKit.Schema {
  static readonly tableName = AccountIdKit.tableName;
  static readonly create = AccountIdKit.create;
  static readonly make = AccountIdKit.make;
  static readonly is = AccountIdKit.is;
}

export class ApiKeyId extends ApiKeyKit.Schema {
  static readonly tableName = ApiKeyKit.tableName;
  static readonly create = ApiKeyKit.create;
  static readonly make = ApiKeyKit.make;
  static readonly is = ApiKeyKit.is;
}

export class InvitationId extends InvitationIdKit.Schema {
  static readonly tableName = InvitationIdKit.tableName;
  static readonly create = InvitationIdKit.create;
  static readonly make = InvitationIdKit.make;
  static readonly is = InvitationIdKit.is;
}

export class JwksId extends JwksIdKit.Schema {
  static readonly tableName = JwksIdKit.tableName;
  static readonly create = JwksIdKit.create;
  static readonly make = JwksIdKit.make;
  static readonly is = JwksIdKit.is;
}

export class MemberId extends MemberIdKit.Schema {
  static readonly tableName = MemberIdKit.tableName;
  static readonly create = MemberIdKit.create;
  static readonly make = MemberIdKit.make;
  static readonly is = MemberIdKit.is;
}

export class OAuthAccessTokenId extends OAuthAccessTokenIdKit.Schema {
  static readonly tableName = OAuthAccessTokenIdKit.tableName;
  static readonly create = OAuthAccessTokenIdKit.create;
  static readonly make = OAuthAccessTokenIdKit.make;
  static readonly is = OAuthAccessTokenIdKit.is;
}

export class OAuthApplicationId extends OAuthApplicationIdKit.Schema {
  static readonly tableName = OAuthApplicationIdKit.tableName;
  static readonly create = OAuthApplicationIdKit.create;
  static readonly make = OAuthApplicationIdKit.make;
  static readonly is = OAuthApplicationIdKit.is;
}

export class OAuthConsentId extends OAuthConsentIdKit.Schema {
  static readonly tableName = OAuthConsentIdKit.tableName;
  static readonly create = OAuthConsentIdKit.create;
  static readonly make = OAuthConsentIdKit.make;
  static readonly is = OAuthConsentIdKit.is;
}

export class PasskeyId extends PasskeyIdKit.Schema {
  static readonly tableName = PasskeyIdKit.tableName;
  static readonly create = PasskeyIdKit.create;
  static readonly make = PasskeyIdKit.make;
  static readonly is = PasskeyIdKit.is;
}

export class RateLimitId extends RateLimitIdKit.Schema {
  static readonly tableName = RateLimitIdKit.tableName;
  static readonly create = RateLimitIdKit.create;
  static readonly make = RateLimitIdKit.make;
  static readonly is = RateLimitIdKit.is;
}

export class SessionId extends SessionIdKit.Schema {
  static readonly tableName = SessionIdKit.tableName;
  static readonly create = SessionIdKit.create;
  static readonly make = SessionIdKit.make;
  static readonly is = SessionIdKit.is;
}

export class SsoProviderId extends SsoProviderIdKit.Schema {
  static readonly tableName = SsoProviderIdKit.tableName;
  static readonly create = SsoProviderIdKit.create;
  static readonly make = SsoProviderIdKit.make;
  static readonly is = SsoProviderIdKit.is;
}

export class SubscriptionId extends SubscriptionIdKit.Schema {
  static readonly tableName = SubscriptionIdKit.tableName;
  static readonly create = SubscriptionIdKit.create;
  static readonly make = SubscriptionIdKit.make;
  static readonly is = SubscriptionIdKit.is;
}

export class TeamMemberId extends TeamMemberIdKit.Schema {
  static readonly tableName = TeamMemberIdKit.tableName;
  static readonly create = TeamMemberIdKit.create;
  static readonly make = TeamMemberIdKit.make;
  static readonly is = TeamMemberIdKit.is;
}

export class TwoFactorId extends TwoFactorIdKit.Schema {
  static readonly tableName = TwoFactorIdKit.tableName;
  static readonly create = TwoFactorIdKit.create;
  static readonly make = TwoFactorIdKit.make;
  static readonly is = TwoFactorIdKit.is;
}

export class UserId extends UserIdKit.Schema {
  static readonly tableName = UserIdKit.tableName;
  static readonly create = UserIdKit.create;
  static readonly make = UserIdKit.make;
  static readonly is = UserIdKit.is;
}

export class VerificationId extends VerificationIdKit.Schema {
  static readonly tableName = VerificationIdKit.tableName;
  static readonly create = VerificationIdKit.create;
  static readonly make = VerificationIdKit.make;
  static readonly is = VerificationIdKit.is;
}

export class WalletAddressId extends WalletAddressIdKit.Schema {
  static readonly tableName = WalletAddressIdKit.tableName;
  static readonly create = WalletAddressIdKit.create;
  static readonly make = WalletAddressIdKit.make;
  static readonly is = WalletAddressIdKit.is;
}

export class OrganizationRoleId extends OrganizationRoleIdKit.Schema {
  static readonly tableName = OrganizationRoleIdKit.tableName;
  static readonly create = OrganizationRoleIdKit.create;
  static readonly make = OrganizationRoleIdKit.make;
  static readonly is = OrganizationRoleIdKit.is;
}

export namespace AccountId {
  export type Type = S.Schema.Type<typeof AccountId>;
  export type Encoded = S.Schema.Encoded<typeof AccountId>;
}

export namespace ApiKeyId {
  export type Type = S.Schema.Type<typeof ApiKeyId>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyId>;
}

export namespace InvitationId {
  export type Type = S.Schema.Type<typeof InvitationId>;
  export type Encoded = S.Schema.Encoded<typeof InvitationId>;
}

export namespace JwksId {
  export type Type = S.Schema.Type<typeof JwksId>;
  export type Encoded = S.Schema.Encoded<typeof JwksId>;
}

export namespace MemberId {
  export type Type = S.Schema.Type<typeof MemberId>;
  export type Encoded = S.Schema.Encoded<typeof MemberId>;
}

export namespace OAuthAccessTokenId {
  export type Type = S.Schema.Type<typeof OAuthAccessTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthAccessTokenId>;
}

export namespace OAuthApplicationId {
  export type Type = S.Schema.Type<typeof OAuthApplicationId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthApplicationId>;
}

export namespace OAuthConsentId {
  export type Type = S.Schema.Type<typeof OAuthConsentId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthConsentId>;
}

export namespace PasskeyId {
  export type Type = S.Schema.Type<typeof PasskeyId>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyId>;
}

export namespace RateLimitId {
  export type Type = S.Schema.Type<typeof RateLimitId>;
  export type Encoded = S.Schema.Encoded<typeof RateLimitId>;
}

export namespace SessionId {
  export type Type = S.Schema.Type<typeof SessionId>;
  export type Encoded = S.Schema.Encoded<typeof SessionId>;
}

export namespace SsoProviderId {
  export type Type = S.Schema.Type<typeof SsoProviderId>;
  export type Encoded = S.Schema.Encoded<typeof SsoProviderId>;
}

export namespace SubscriptionId {
  export type Type = S.Schema.Type<typeof SubscriptionId>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionId>;
}

export namespace TeamMemberId {
  export type Type = S.Schema.Type<typeof TeamMemberId>;
  export type Encoded = S.Schema.Encoded<typeof TeamMemberId>;
}

export namespace TwoFactorId {
  export type Type = S.Schema.Type<typeof TwoFactorId>;
  export type Encoded = S.Schema.Encoded<typeof TwoFactorId>;
}

export namespace UserId {
  export type Type = S.Schema.Type<typeof UserId>;
  export type Encoded = S.Schema.Encoded<typeof UserId>;
}

export namespace VerificationId {
  export type Type = S.Schema.Type<typeof VerificationId>;
  export type Encoded = S.Schema.Encoded<typeof VerificationId>;
}

export namespace WalletAddressId {
  export type Type = S.Schema.Type<typeof WalletAddressId>;
  export type Encoded = S.Schema.Encoded<typeof WalletAddressId>;
}

export namespace OrganizationRoleId {
  export type Type = S.Schema.Type<typeof OrganizationRoleId>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleId>;
}
