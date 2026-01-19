/**
 * Knowledge table names union
 *
 * @module knowledge/entity-ids/table-name
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/knowledge/table-names");

/**
 * Table names for knowledge slice.
 *
 * @since 0.1.0
 * @category ids
 */
export class TableName extends BS.StringLiteralKit(
  Ids.EmbeddingId.tableName,
  Ids.KnowledgeEntityId.tableName,
  Ids.RelationId.tableName,
  Ids.OntologyId.tableName,
  Ids.ExtractionId.tableName,
  Ids.MentionId.tableName
).annotations(
  $I.annotations("KnowledgeTableName", {
    description: "A sql table name for an entity within the knowledge domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
