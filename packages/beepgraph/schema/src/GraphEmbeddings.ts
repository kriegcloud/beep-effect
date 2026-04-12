/**
 * Graph embeddings query request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TermSchema, TgError } from "./Primitives.ts";

export const GraphEmbeddingsRequest = Schema.Struct({
  vectors: Schema.Array(Schema.Array(Schema.Number)),
  user: Schema.optionalKey(Schema.String),
  limit: Schema.optionalKey(Schema.Number),
  collection: Schema.optionalKey(Schema.String),
});

export type GraphEmbeddingsRequest = typeof GraphEmbeddingsRequest.Type;

export const GraphEmbeddingsResponse = Schema.Struct({
  entities: Schema.Array(TermSchema),
  error: Schema.optionalKey(TgError),
});

export type GraphEmbeddingsResponse = typeof GraphEmbeddingsResponse.Type;
