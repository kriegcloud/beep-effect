/**
 * Embeddings request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const EmbeddingsRequest = Schema.Struct({
  text: Schema.Array(Schema.String),
  model: Schema.optionalKey(Schema.String),
});

export type EmbeddingsRequest = typeof EmbeddingsRequest.Type;

export const EmbeddingsResponse = Schema.Struct({
  vectors: Schema.Array(Schema.Array(Schema.Number)),
  error: Schema.optionalKey(TgError),
});

export type EmbeddingsResponse = typeof EmbeddingsResponse.Type;
