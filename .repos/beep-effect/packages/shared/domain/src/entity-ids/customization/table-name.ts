import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/customization/table-names");

export class TableName extends BS.StringLiteralKit(Ids.UserHotkeyId.tableName).annotations(
  $I.annotations("CustomizationTableName", {
    description: "A sql table name for an entity within the customization domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
