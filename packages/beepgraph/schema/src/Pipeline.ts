/**
 * Pipeline message types — document ingestion stages.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TermSchema, TripleSchema } from "./Primitives.ts";

export const PipelineMetadata = Schema.Struct({
  id: Schema.String,
  root: Schema.String,
  user: Schema.String,
  collection: Schema.String,
});

export type PipelineMetadata = typeof PipelineMetadata.Type;

export const Document = Schema.Struct({
  metadata: PipelineMetadata,
  documentId: Schema.String,
});

export type Document = typeof Document.Type;

export const TextDocument = Schema.Struct({
  metadata: PipelineMetadata,
  text: Schema.String,
  documentId: Schema.String,
});

export type TextDocument = typeof TextDocument.Type;

export const Chunk = Schema.Struct({
  metadata: PipelineMetadata,
  chunk: Schema.String,
  documentId: Schema.String,
});

export type Chunk = typeof Chunk.Type;

export const EntityContext = Schema.Struct({
  entity: TermSchema,
  context: Schema.String,
  chunkId: Schema.String,
});

export type EntityContext = typeof EntityContext.Type;

export const EntityContexts = Schema.Struct({
  metadata: PipelineMetadata,
  entities: Schema.Array(EntityContext),
});

export type EntityContexts = typeof EntityContexts.Type;

export const Triples = Schema.Struct({
  metadata: PipelineMetadata,
  triples: Schema.Array(TripleSchema),
});

export type Triples = typeof Triples.Type;
