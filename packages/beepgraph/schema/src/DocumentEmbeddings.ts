/**
 * Document embeddings query request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const DocumentEmbeddingsChunk = Schema.Struct({
  chunkId: Schema.String,
  score: Schema.Number,
  content: Schema.optionalKey(Schema.String),
});

export type DocumentEmbeddingsChunk = typeof DocumentEmbeddingsChunk.Type;

export const DocumentEmbeddingsRequest = Schema.Struct({
  vectors: Schema.Array(Schema.Array(Schema.Number)),
  limit: Schema.optionalKey(Schema.Number),
  user: Schema.optionalKey(Schema.String),
  collection: Schema.optionalKey(Schema.String),
});

export type DocumentEmbeddingsRequest = typeof DocumentEmbeddingsRequest.Type;

export const DocumentEmbeddingsResponse = Schema.Struct({
  chunks: Schema.Array(DocumentEmbeddingsChunk),
  error: Schema.optionalKey(TgError),
});

export type DocumentEmbeddingsResponse = typeof DocumentEmbeddingsResponse.Type;
