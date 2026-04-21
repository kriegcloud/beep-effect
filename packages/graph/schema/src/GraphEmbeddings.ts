/**
 * Graph embeddings query request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { Term, TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("GraphEmbeddings");

/**
 * Request payload for graph-embedding similarity queries.
 *
 * @since 0.1.0
 * @category models
 */
export class GraphEmbeddingsRequest extends S.Class<GraphEmbeddingsRequest>($I`GraphEmbeddingsRequest`)({
  vectors: S.Array(S.Array(S.Number)).annotateKey({
    description: "Embedding vectors used to locate related graph entities.",
  }),
  user: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional user or tenant scope for the search.",
  }),
  limit: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Optional maximum number of entities to return.",
  }),
  collection: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional collection identifier used to constrain the search.",
  }),
}, $I.annote("GraphEmbeddingsRequest", {
  description: "Request payload for graph-embedding similarity queries.",
})) {}

/**
 * Response payload for graph-embedding similarity queries.
 *
 * @since 0.1.0
 * @category models
 */
export class GraphEmbeddingsResponse extends S.Class<GraphEmbeddingsResponse>($I`GraphEmbeddingsResponse`)({
  entities: S.Array(Term).annotateKey({
    description: "Matched graph entities returned by the similarity search.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the search fails.",
  }),
}, $I.annote("GraphEmbeddingsResponse", {
  description: "Response payload for graph-embedding similarity queries.",
})) {}
