/**
 * Embedding entity model for Knowledge slice
 *
 * Stores vector embeddings for knowledge graph entities,
 * enabling semantic search and similarity matching.
 *
 * @module knowledge-domain/entities/Embedding
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Embedding");

/**
 * Entity types that can have embeddings.
 *
 * @since 0.1.0
 * @category schemas
 */
export class EntityType extends BS.StringLiteralKit("class", "entity", "claim", "example").annotations({
  identifier: "EmbeddingEntityType",
  description: "Type of entity this embedding represents",
}) {}

export declare namespace EntityType {
  export type Type = typeof EntityType.Type;
}

/**
 * Schema for 768-dimensional embedding vectors (Nomic embed text v1.5).
 *
 * @since 0.1.0
 * @category schemas
 */
export const EmbeddingVector = S.Array(S.Number).annotations({
  identifier: "EmbeddingVector",
  description: "768-dimensional embedding vector for semantic search",
});

/**
 * Embedding model for the knowledge slice.
 *
 * Stores vector embeddings for knowledge graph entities (classes, entities,
 * claims, examples) to enable semantic search and similarity matching.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const embedding = Entities.Embedding.Model.insert.make({
 *   id: KnowledgeEntityIds.EmbeddingId.make("knowledge_embedding__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   entityType: "class",
 *   entityId: "my-entity-id",
 *   embedding: new Array(768).fill(0),
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`EmbeddingModel`)(
  makeFields(KnowledgeEntityIds.EmbeddingId, {
    organizationId: SharedEntityIds.OrganizationId,

    // What this embedding represents
    entityType: EntityType,
    entityId: S.String.annotations({
      description: "ID of the entity this embedding represents",
    }),

    // Ontology scoping
    ontologyId: BS.toOptionalWithDefault(S.String)("default").annotations({
      description: "Ontology scope for this embedding",
    }),

    // The embedding vector (768-dim for Nomic)
    embedding: EmbeddingVector,

    // Text content for hybrid search
    contentText: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Text content for hybrid search (optional)",
      })
    ),

    // Model provenance
    model: BS.toOptionalWithDefault(S.String)("nomic-embed-text-v1.5").annotations({
      description: "Model used to generate this embedding",
    }),
  }),
  $I.annotations("EmbeddingModel", {
    description: "Vector embedding for knowledge graph entities enabling semantic search.",
  })
) {
  static readonly utils = modelKit(Model);
}
