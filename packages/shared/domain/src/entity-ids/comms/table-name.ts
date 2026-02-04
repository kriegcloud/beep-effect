/**
 * Comms table names union
 *
 * @module comms/entity-ids/table-name
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/comms/table-names");

/**
 * Table names for comms slice.
 *
 * @since 0.1.0
 * @category ids
 */
export class TableName extends BS.StringLiteralKit(
  Ids.EmailTemplateId.tableName,
  Ids.ConnectionId.tableName,
  Ids.ThreadSummaryId.tableName,
  Ids.NoteId.tableName,
  Ids.UserSettingsId.tableName,
  Ids.UserHotkeysId.tableName
).annotations(
  $I.annotations("CommsTableName", {
    description: "A sql table name for an entity within the comms domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
