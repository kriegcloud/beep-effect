import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Kits from "./kits";

export const IamTableNameKit = BS.stringLiteralKit(
  Kits.AccountIdKit.tableName,
  Kits.ApiKeyKit.tableName,
  Kits.InvitationIdKit.tableName,
  Kits.JwksIdKit.tableName,
  Kits.MemberIdKit.tableName,
  Kits.OAuthAccessTokenIdKit.tableName,
  Kits.OAuthApplicationIdKit.tableName,
  Kits.OAuthConsentIdKit.tableName,
  Kits.PasskeyIdKit.tableName,
  Kits.RateLimitIdKit.tableName,
  Kits.SessionIdKit.tableName,
  Kits.SsoProviderIdKit.tableName,
  Kits.SubscriptionIdKit.tableName,
  Kits.TeamMemberIdKit.tableName,
  Kits.TwoFactorIdKit.tableName,
  Kits.UserIdKit.tableName,
  Kits.VerificationIdKit.tableName,
  Kits.WalletAddressIdKit.tableName,
  Kits.OrganizationRoleIdKit.tableName
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
