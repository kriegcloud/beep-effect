/**
 * Knowledge core management request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TermSchema, TgError, TripleSchema } from "./Primitives.ts";

export const KnowledgeOperation = Schema.Literals([
  "list-kg-cores",
  "get-kg-core",
  "delete-kg-core",
  "put-kg-core",
  "load-kg-core",
]);

export type KnowledgeOperation = typeof KnowledgeOperation.Type;

const GraphEmbeddingEntry = Schema.Struct({
  entity: TermSchema,
  vectors: Schema.Array(Schema.Array(Schema.Number)),
});

export const KnowledgeRequest = Schema.Struct({
  operation: KnowledgeOperation,
  user: Schema.optionalKey(Schema.String),
  id: Schema.optionalKey(Schema.String),
  flow: Schema.optionalKey(Schema.String),
  collection: Schema.optionalKey(Schema.String),
  triples: Schema.optionalKey(Schema.Array(TripleSchema)),
  graphEmbeddings: Schema.optionalKey(Schema.Array(GraphEmbeddingEntry)),
});

export type KnowledgeRequest = typeof KnowledgeRequest.Type;

export const KnowledgeResponse = Schema.Struct({
  error: Schema.optionalKey(TgError),
  ids: Schema.optionalKey(Schema.Array(Schema.String)),
  eos: Schema.optionalKey(Schema.Boolean),
  triples: Schema.optionalKey(Schema.Array(TripleSchema)),
  graphEmbeddings: Schema.optionalKey(Schema.Array(GraphEmbeddingEntry)),
});

export type KnowledgeResponse = typeof KnowledgeResponse.Type;
