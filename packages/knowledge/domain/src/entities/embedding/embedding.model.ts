import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Embedding");

export class EntityType extends BS.StringLiteralKit("class", "entity", "relation").annotations({
  identifier: "EmbeddingEntityType",
  description: "Type of entity this embedding represents",
}) {}

export declare namespace EntityType {
  export type Type = typeof EntityType.Type;
}

export const EmbeddableEntityId = S.Union(
  KnowledgeEntityIds.ClassDefinitionId,
  KnowledgeEntityIds.KnowledgeEntityId,
  KnowledgeEntityIds.RelationId
).annotations({
  identifier: "EmbeddableEntityId",
  description: "ID of a class definition, knowledge entity, or relation that can have embeddings",
});

export const EMBEDDING_DIMENSION = 768 as const;

export const EmbeddingVector = S.Array(S.Number.pipe(S.finite())).pipe(
  S.itemsCount(EMBEDDING_DIMENSION),
  S.annotations({
    identifier: "EmbeddingVector",
    description: `${EMBEDDING_DIMENSION}-dimensional embedding vector for semantic search`,
  })
);

export class Model extends M.Class<Model>($I`EmbeddingModel`)(
  makeFields(KnowledgeEntityIds.EmbeddingId, {
    organizationId: SharedEntityIds.OrganizationId,
    entityType: EntityType,
    entityId: EmbeddableEntityId.annotations({
      description: "ID of the entity this embedding represents (class, entity, or relation)",
    }),
    ontologyId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.OntologyId.annotations({
        description: "Ontology scope for this embedding (omit for default ontology)",
      })
    ),
    embedding: EmbeddingVector,
    contentText: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Text content for hybrid search (optional)",
      })
    ),
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
