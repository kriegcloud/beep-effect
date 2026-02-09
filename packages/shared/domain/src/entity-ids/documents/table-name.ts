import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/documents/table-names");

export class TableName extends BS.StringLiteralKit(
  Ids.DocumentId.tableName,
  Ids.DocumentVersionId.tableName,
  Ids.DocumentSourceId.tableName,
  Ids.DiscussionId.tableName,
  Ids.CommentId.tableName,
  Ids.DocumentFileId.tableName,
  Ids.PageId.tableName,
  Ids.PageShareId.tableName,
).annotations(
  $I.annotations("DocumentsTableName", {
    description: "A sql table name for an entity within the documents domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
