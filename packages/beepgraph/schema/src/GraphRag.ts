/**
 * Graph RAG request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError, TripleSchema } from "./Primitives.ts";

export const GraphRagRequest = Schema.Struct({
  query: Schema.String,
  collection: Schema.optionalKey(Schema.String),
  entityLimit: Schema.optionalKey(Schema.Number),
  tripleLimit: Schema.optionalKey(Schema.Number),
  maxSubgraphSize: Schema.optionalKey(Schema.Number),
  maxPathLength: Schema.optionalKey(Schema.Number),
  streaming: Schema.optionalKey(Schema.Boolean),
});

export type GraphRagRequest = typeof GraphRagRequest.Type;

export const GraphRagResponse = Schema.Struct({
  response: Schema.String,
  error: Schema.optionalKey(TgError),
  endOfStream: Schema.optionalKey(Schema.Boolean),
  message_type: Schema.optionalKey(Schema.Literals(["chunk", "explain"])),
  explain_id: Schema.optionalKey(Schema.String),
  explain_triples: Schema.optionalKey(Schema.Array(TripleSchema)),
});

export type GraphRagResponse = typeof GraphRagResponse.Type;
