/**
 * Document embeddings query request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("DocumentEmbeddings");

/**
 * Single document chunk returned by a document-embedding search.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentEmbeddingsChunk extends S.Class<DocumentEmbeddingsChunk>($I`DocumentEmbeddingsChunk`)({
  chunkId: S.String.annotateKey({
    description: "Stable identifier for the matched document chunk.",
  }),
  score: S.Number.annotateKey({
    description: "Similarity score assigned to the matched chunk.",
  }),
  content: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional raw chunk content returned alongside the score.",
  }),
}, $I.annote("DocumentEmbeddingsChunk", {
  description: "Single document chunk returned by a document-embedding search.",
})) {}

/**
 * Request payload for document-embedding similarity queries.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentEmbeddingsRequest extends S.Class<DocumentEmbeddingsRequest>($I`DocumentEmbeddingsRequest`)({
  vectors: S.Array(S.Array(S.Number)).annotateKey({
    description: "Embedding vectors used to search for similar document chunks.",
  }),
  limit: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Optional maximum number of chunks to return.",
  }),
  user: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional user or tenant scope for the search.",
  }),
  collection: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional collection identifier to constrain the search.",
  }),
}, $I.annote("DocumentEmbeddingsRequest", {
  description: "Request payload for document-embedding similarity queries.",
})) {}

/**
 * Response payload for document-embedding similarity queries.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentEmbeddingsResponse extends S.Class<DocumentEmbeddingsResponse>($I`DocumentEmbeddingsResponse`)({
  chunks: S.Array(DocumentEmbeddingsChunk).annotateKey({
    description: "Matched document chunks returned by the search.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the search fails.",
  }),
}, $I.annote("DocumentEmbeddingsResponse", {
  description: "Response payload for document-embedding similarity queries.",
})) {}
