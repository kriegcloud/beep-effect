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
} from "./iam";
import { AuditLogId, FileId, OrganizationId, TeamId, UserId } from "./shared";

export namespace SharedTableNames {
  export const SharedTableNameKit = BS.stringLiteralKit(
    FileId.tableName,
    TeamId.tableName,
    OrganizationId.tableName,
    UserId.tableName,
    AuditLogId.tableName
  );

  export class SharedTableName extends SharedTableNameKit.Schema.annotations({
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SharedTableName"),
    description: "The set of table_names for entityIds within the shared-kernel",
    identifier: "SharedTableName",
    title: "Shared Table Name",
  }) {
    static readonly Tagged = SharedTableNameKit.toTagged("tableName");
    static readonly Enum = SharedTableNameKit.Enum;
    static readonly Options = SharedTableNameKit.Options;
    static readonly is = SharedTableNameKit.is;
  }

  export namespace SharedTableName {
    export type Type = S.Schema.Type<typeof SharedTableName>;
    export type Encoded = S.Schema.Encoded<typeof SharedTableName>;
  }
}

export namespace IamTableNames {
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

  export namespace IamTableName {
    export type Type = S.Schema.Type<typeof IamTableName>;
    export type Encoded = S.Schema.Encoded<typeof IamTableName>;
  }
}

export const AnyTableNameKit = BS.stringLiteralKit(
  ...IamTableNames.IamTableNameKit.Options,
  ...SharedTableNames.SharedTableNameKit.Options
);

export class AnyTableName extends AnyTableNameKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/AnyTableName"),
  description: "The set of table_names for entityIds within the shared-kernel and iam domain slices",
  identifier: "AnyTableName",
  title: "Any Table Name",
}) {
  static readonly Tagged = AnyTableNameKit.toTagged("tableName");
  static readonly Enum = AnyTableNameKit.Enum;
  static readonly Options = AnyTableNameKit.Options;
}

export namespace AnyTableName {
  export type Type = S.Schema.Type<typeof AnyTableName>;
  export type Encoded = S.Schema.Encoded<typeof AnyTableName>;
}
