/**
 * Knowledge any entity ID union
 *
 * @module knowledge/entity-ids/any-id
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/knowledge/any-id");

/**
 * Union of all knowledge entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export class AnyId extends S.Union(
  Ids.EmbeddingId,
  Ids.KnowledgeEntityId,
  Ids.RelationId,
  Ids.OntologyId,
  Ids.ExtractionId,
  Ids.MentionId,
  Ids.MentionRecordId,
  Ids.MergeHistoryId,
  Ids.WorkflowExecutionId,
  Ids.WorkflowActivityId,
  Ids.WorkflowSignalId,
  Ids.BatchExecutionId
).annotations(
  $I.annotations("AnyKnowledgeId", {
    description: "Any entity id within the knowledge domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
