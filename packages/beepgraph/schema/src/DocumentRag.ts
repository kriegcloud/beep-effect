/**
 * Document RAG request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const DocumentRagRequest = Schema.Struct({
  query: Schema.String,
  collection: Schema.optionalKey(Schema.String),
  streaming: Schema.optionalKey(Schema.Boolean),
});

export type DocumentRagRequest = typeof DocumentRagRequest.Type;

export const DocumentRagResponse = Schema.Struct({
  response: Schema.String,
  error: Schema.optionalKey(TgError),
  endOfStream: Schema.optionalKey(Schema.Boolean),
});

export type DocumentRagResponse = typeof DocumentRagResponse.Type;
