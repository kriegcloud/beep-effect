/**
 * Knowledge core management request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

import { Term, TgError, Triple } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Knowledge");

/**
 * Knowledge-core management commands supported by the graph service.
 *
 * @since 0.1.0
 * @category models
 */
export const KnowledgeOperation = LiteralKit([
  "list-kg-cores",
  "get-kg-core",
  "delete-kg-core",
  "put-kg-core",
  "load-kg-core",
] as const).pipe(
  $I.annoteSchema("KnowledgeOperation", {
    description: "Knowledge-core management commands supported by the graph service.",
  }),
);

/**
 * Type for {@link KnowledgeOperation}. {@inheritDoc KnowledgeOperation}
 *
 * @category models
 * @since 0.1.0
 */
export type KnowledgeOperation = typeof KnowledgeOperation.Type;

class GraphEmbeddingEntry extends S.Class<GraphEmbeddingEntry>($I`GraphEmbeddingEntry`)({
  entity: Term.annotateKey({
    description: "Graph entity associated with the embedding vectors.",
  }),
  vectors: S.Array(S.Array(S.Number)).annotateKey({
    description: "Embedding vectors stored for the entity.",
  }),
}, $I.annote("GraphEmbeddingEntry", {
  description: "Knowledge-core graph embedding entry.",
})) {}

const makeKnowledgeRequest = <TOperation extends KnowledgeOperation>(literal: S.Literal<TOperation>) =>
  S.Struct({
    operation: S.tag(literal.literal).annotateKey({
      description: "Knowledge-core management command to perform.",
    }),
    user: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional user or tenant scope for the operation.",
    }),
    id: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional knowledge-core identifier targeted by the command.",
    }),
    flow: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional flow identifier associated with the knowledge core.",
    }),
    collection: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional collection identifier used to scope the command.",
    }),
    triples: S.OptionFromOptionalKey(S.Array(Triple)).annotateKey({
      description: "Optional triples supplied when loading or updating a core.",
    }),
    graphEmbeddings: S.OptionFromOptionalKey(S.Array(GraphEmbeddingEntry)).annotateKey({
      description: "Optional graph embedding entries supplied with the request.",
    }),
  });

/**
 * Request payload for knowledge-core management operations.
 *
 * @since 0.1.0
 * @category models
 */
export const KnowledgeRequest = KnowledgeOperation.mapMembers((members) =>
  pipe(members, Tuple.evolve([makeKnowledgeRequest, makeKnowledgeRequest, makeKnowledgeRequest, makeKnowledgeRequest, makeKnowledgeRequest]))
).pipe(
  S.toTaggedUnion("operation"),
  $I.annoteSchema("KnowledgeRequest", {
    description: "Request payload for knowledge-core management operations.",
  }),
);

/**
 * Type for {@link KnowledgeRequest}. {@inheritDoc KnowledgeRequest}
 *
 * @category models
 * @since 0.1.0
 */
export type KnowledgeRequest = typeof KnowledgeRequest.Type;

/**
 * Response payload for knowledge-core management operations.
 *
 * @since 0.1.0
 * @category models
 */
export class KnowledgeResponse extends S.Class<KnowledgeResponse>($I`KnowledgeResponse`)({
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the operation fails.",
  }),
  ids: S.OptionFromOptionalKey(S.Array(S.String)).annotateKey({
    description: "Knowledge-core identifiers returned by list-style commands.",
  }),
  eos: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Streaming sentinel indicating the final response fragment.",
  }),
  triples: S.OptionFromOptionalKey(S.Array(Triple)).annotateKey({
    description: "Triples returned by knowledge-core read operations.",
  }),
  graphEmbeddings: S.OptionFromOptionalKey(S.Array(GraphEmbeddingEntry)).annotateKey({
    description: "Graph embedding entries returned by the operation.",
  }),
}, $I.annote("KnowledgeResponse", {
  description: "Response payload for knowledge-core management operations.",
})) {}
