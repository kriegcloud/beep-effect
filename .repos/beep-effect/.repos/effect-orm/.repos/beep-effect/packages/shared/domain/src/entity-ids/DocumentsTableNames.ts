import { BS } from "@beep/schema";
import {
  CommentId,
  DiscussionId,
  DocumentFileId,
  DocumentId,
  DocumentVersionId,
} from "@beep/shared-domain/entity-ids/documents";
import type * as S from "effect/Schema";

export class DocumentsTableName extends BS.StringLiteralKit(
  DocumentId.tableName,
  DocumentVersionId.tableName,
  DiscussionId.tableName,
  CommentId.tableName,
  DocumentFileId.tableName
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/DocumentsTableName"),
  description: "The set of table_names for entities within the documents bounded context",
  identifier: "DocumentsTableName",
  title: "Knowledge Management Table Name",
}) {
  static readonly Tagged = DocumentsTableName.toTagged("tableName");
}

export declare namespace DocumentsTableName {
  export type Type = S.Schema.Type<typeof DocumentsTableName>;
  export type Encoded = S.Schema.Encoded<typeof DocumentsTableName>;
}
