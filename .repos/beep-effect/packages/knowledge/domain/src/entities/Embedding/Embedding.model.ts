import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
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

const EmbeddingVectorArray = S.Array(S.Number.pipe(S.finite())).pipe(S.itemsCount(EMBEDDING_DIMENSION));

/**
 * Pgvector stores vectors as strings like "[0.1,0.2,...]". Our DB layer uses node-postgres,
 * so we encode/decode embeddings to/from that wire format to keep the domain type as `number[]`.
 */
export const EmbeddingVector: S.Schema<S.Schema.Type<typeof EmbeddingVectorArray>, string> = S.transformOrFail(
  S.String.annotations({
    description: `pgvector literal for ${EMBEDDING_DIMENSION}-dimensional embedding`,
    examples: ["[0,1,0,...]"],
  }),
  EmbeddingVectorArray.annotations({
    identifier: "EmbeddingVector",
    description: `${EMBEDDING_DIMENSION}-dimensional embedding vector for semantic search`,
  }),
  {
    strict: true,
    decode: (vectorString, _, ast) => {
      if (!vectorString.startsWith("[") || !vectorString.endsWith("]")) {
        return Effect.fail(
          new ParseResult.Type(ast, vectorString, `Expected pgvector literal like "[...]", received "${vectorString}"`)
        );
      }
      const inner = vectorString.slice(1, -1).trim();
      const parts = inner.length === 0 ? [] : inner.split(",");
      const vector = parts.map((p) => Number(p));
      if (vector.some((n) => !Number.isFinite(n))) {
        return Effect.fail(new ParseResult.Type(ast, vectorString, "Embedding vector contains non-finite numbers"));
      }
      if (vector.length !== EMBEDDING_DIMENSION) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            vectorString,
            `Expected ${EMBEDDING_DIMENSION} dimensions, received ${vector.length}`
          )
        );
      }
      return Effect.succeed(vector);
    },
    encode: (vector, _, ast) => {
      if (vector.length !== EMBEDDING_DIMENSION) {
        return Effect.fail(
          new ParseResult.Type(ast, vector, `Expected ${EMBEDDING_DIMENSION} dimensions, received ${vector.length}`)
        );
      }
      if (vector.some((n) => !Number.isFinite(n))) {
        return Effect.fail(new ParseResult.Type(ast, vector, "Embedding vector contains non-finite numbers"));
      }
      return Effect.succeed(`[${vector.join(",")}]`);
    },
  }
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
