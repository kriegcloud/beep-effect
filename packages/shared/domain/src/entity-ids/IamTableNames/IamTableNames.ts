import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import {
  AccountId,
  ApiKeyId,
  DeviceCodeId,
  InvitationId,
  JwksId,
  MemberId,
  OAuthAccessTokenId,
  OAuthApplicationId,
  OAuthConsentId,
  OrganizationRoleId,
  PasskeyId,
  RateLimitId,
  SessionId,
  SsoProviderId,
  SubscriptionId,
  TeamMemberId,
  TwoFactorId,
  VerificationId,
  WalletAddressId,
} from "../iam";

export const IamTableNameKit = BS.stringLiteralKit(
  AccountId.tableName,
  ApiKeyId.tableName,
  InvitationId.tableName,
  JwksId.tableName,
  MemberId.tableName,
  OAuthAccessTokenId.tableName,
  OAuthApplicationId.tableName,
  OAuthConsentId.tableName,
  PasskeyId.tableName,
  RateLimitId.tableName,
  SessionId.tableName,
  SsoProviderId.tableName,
  SubscriptionId.tableName,
  TeamMemberId.tableName,
  TwoFactorId.tableName,
  VerificationId.tableName,
  WalletAddressId.tableName,
  OrganizationRoleId.tableName,
  DeviceCodeId.tableName
);

export class IamTableName extends IamTableNameKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/IamTableName"),
  description: "The set of table_names for entityIds within the iam domain slice",
  identifier: "IamTableName",
  title: "Iam Table Name",
}) {
  static readonly Tagged = IamTableNameKit.toTagged("tableName");
  static readonly Enum = IamTableNameKit.Enum;
  static readonly Options = IamTableNameKit.Options;
  static readonly is = IamTableNameKit.is;
}

export declare namespace IamTableName {
  export type Type = S.Schema.Type<typeof IamTableName>;
  export type Encoded = S.Schema.Encoded<typeof IamTableName>;
}
