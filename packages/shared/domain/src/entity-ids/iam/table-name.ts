import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/iam/table-names");

export class TableName extends BS.StringLiteralKit(
  Ids.AccountId.tableName,
  Ids.ApiKeyId.tableName,
  Ids.InvitationId.tableName,
  Ids.JwksId.tableName,
  Ids.MemberId.tableName,
  Ids.PasskeyId.tableName,
  Ids.RateLimitId.tableName,
  Ids.SsoProviderId.tableName,
  Ids.SubscriptionId.tableName,
  Ids.TeamMemberId.tableName,
  Ids.TwoFactorId.tableName,
  Ids.VerificationId.tableName,
  Ids.WalletAddressId.tableName,
  Ids.OrganizationRoleId.tableName,
  Ids.DeviceCodeId.tableName,
  Ids.ScimProviderId.tableName
).annotations(
  $I.annotations("IamTableName", {
    description: "A sql table name for an entity within the iam domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
