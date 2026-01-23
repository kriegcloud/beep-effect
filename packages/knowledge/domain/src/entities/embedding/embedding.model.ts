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
export class EntityType extends BS.StringLiteralKit("class", "entity", "relation").annotations({
  identifier: "EmbeddingEntityType",
  description: "Type of entity this embedding represents",
}) {}

export declare namespace EntityType {
  export type Type = typeof EntityType.Type;
}

/**
 * Union of embeddable entity IDs.
 *
 * Maps to EntityType:
 * - "class" → ClassDefinitionId
 * - "entity" → KnowledgeEntityId
 * - "relation" → RelationId
 *
 * @since 0.1.0
 * @category schemas
 */
export const EmbeddableEntityId = S.Union(
  KnowledgeEntityIds.ClassDefinitionId,
  KnowledgeEntityIds.KnowledgeEntityId,
  KnowledgeEntityIds.RelationId
).annotations({
  identifier: "EmbeddableEntityId",
  description: "ID of a class definition, knowledge entity, or relation that can have embeddings",
});

/**
 * Embedding dimension for Nomic embed text v1.5 model.
 *
 * @since 0.1.0
 * @category constants
 */
export const EMBEDDING_DIMENSION = 768 as const;

/**
 * Schema for 768-dimensional embedding vectors (Nomic embed text v1.5).
 *
 * Enforces:
 * - Exactly 768 dimensions
 * - Finite numbers only (no NaN/Infinity)
 *
 * @since 0.1.0
 * @category schemas
 */
export const EmbeddingVector = S.Array(S.Number.pipe(S.finite())).pipe(
  S.itemsCount(EMBEDDING_DIMENSION),
  S.annotations({
    identifier: "EmbeddingVector",
    description: `${EMBEDDING_DIMENSION}-dimensional embedding vector for semantic search`,
  })
);

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
 *   entityId: KnowledgeEntityIds.ClassDefinitionId.make("knowledge_class_definition__uuid"),
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
    entityId: EmbeddableEntityId.annotations({
      description: "ID of the entity this embedding represents (class, entity, or relation)",
    }),

    // Ontology scoping
    ontologyId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.OntologyId.annotations({
        description: "Ontology scope for this embedding (omit for default ontology)",
      })
    ),

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
