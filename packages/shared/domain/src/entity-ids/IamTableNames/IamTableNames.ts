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

export class IamTableName extends BS.StringLiteralKit(
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
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/IamTableName"),
  description: "The set of table_names for entityIds within the iam domain slice",
  identifier: "IamTableName",
  title: "Iam Table Name",
}) {
  static readonly Tagged = IamTableName.toTagged("tableName");
}

export declare namespace IamTableName {
  export type Type = S.Schema.Type<typeof IamTableName>;
  export type Encoded = S.Schema.Encoded<typeof IamTableName>;
}
