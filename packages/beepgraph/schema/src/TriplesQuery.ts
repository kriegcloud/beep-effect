/**
 * Triples query request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TermSchema, TgError, TripleSchema } from "./Primitives.ts";

export const TriplesQueryRequest = Schema.Struct({
  s: Schema.optionalKey(TermSchema),
  p: Schema.optionalKey(TermSchema),
  o: Schema.optionalKey(TermSchema),
  collection: Schema.optionalKey(Schema.String),
  limit: Schema.optionalKey(Schema.Number),
});

export type TriplesQueryRequest = typeof TriplesQueryRequest.Type;

export const TriplesQueryResponse = Schema.Struct({
  triples: Schema.Array(TripleSchema),
  error: Schema.optionalKey(TgError),
});

export type TriplesQueryResponse = typeof TriplesQueryResponse.Type;
