/**
 * Calendar table names union
 *
 * @module calendar/entity-ids/table-name
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/calendar/table-names");

/**
 * Table names for calendar slice.
 *
 * @since 0.1.0
 * @category ids
 */
export class TableName extends BS.StringLiteralKit(Ids.PlaceholderId.tableName).annotations(
  $I.annotations("CalendarTableName", {
    description: "A sql table name for an entity within the calendar domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
