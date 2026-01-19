/**
 * Wealth Management table names union
 *
 * @module wealth-management/entity-ids/table-name
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/wealth-management/table-names");

/**
 * Table names for wealth-management slice.
 *
 * @since 0.1.0
 * @category ids
 */
export class TableName extends BS.StringLiteralKit(
  Ids.WmClientId.tableName,
  Ids.WmAccountId.tableName,
  Ids.WmInvestmentId.tableName,
  Ids.WmTrustId.tableName,
  Ids.WmHouseholdId.tableName,
  Ids.WmBeneficiaryId.tableName,
  Ids.WmCustodianId.tableName,
  Ids.WmLegalEntityId.tableName
).annotations(
  $I.annotations("WmTableName", {
    description: "A sql table name for an entity within the wealth-management domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
