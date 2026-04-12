/**
 * Librarian service request/response schemas + document metadata types.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError, TripleSchema } from "./Primitives.ts";

// ---------------------------------------------------------------------------
// Document / Processing metadata
// ---------------------------------------------------------------------------

export const DocumentMetadata = Schema.Struct({
  id: Schema.String,
  time: Schema.Number,
  kind: Schema.String,
  title: Schema.String,
  comments: Schema.String,
  user: Schema.String,
  tags: Schema.Array(Schema.String),
  parentId: Schema.optionalKey(Schema.String),
  documentType: Schema.String,
  metadata: Schema.optionalKey(Schema.Array(TripleSchema)),
});

export type DocumentMetadata = typeof DocumentMetadata.Type;

export const ProcessingMetadata = Schema.Struct({
  id: Schema.String,
  documentId: Schema.String,
  time: Schema.Number,
  flow: Schema.String,
  user: Schema.String,
  collection: Schema.String,
  tags: Schema.Array(Schema.String),
});

export type ProcessingMetadata = typeof ProcessingMetadata.Type;

// ---------------------------------------------------------------------------
// Librarian request / response
// ---------------------------------------------------------------------------

export const LibrarianOperation = Schema.Literals([
  "add-document",
  "remove-document",
  "list-documents",
  "get-document-metadata",
  "get-document-content",
  "add-child-document",
  "list-children",
  "add-processing",
  "remove-processing",
  "list-processing",
]);

export type LibrarianOperation = typeof LibrarianOperation.Type;

export const LibrarianRequest = Schema.Struct({
  operation: LibrarianOperation,
  documentId: Schema.optionalKey(Schema.String),
  processingId: Schema.optionalKey(Schema.String),
  documentMetadata: Schema.optionalKey(DocumentMetadata),
  processingMetadata: Schema.optionalKey(ProcessingMetadata),
  content: Schema.optionalKey(Schema.String),
  user: Schema.optionalKey(Schema.String),
  collection: Schema.optionalKey(Schema.String),
});

export type LibrarianRequest = typeof LibrarianRequest.Type;

export const LibrarianResponse = Schema.Struct({
  error: Schema.optionalKey(TgError),
  documentMetadata: Schema.optionalKey(DocumentMetadata),
  content: Schema.optionalKey(Schema.String),
  documents: Schema.optionalKey(Schema.Array(DocumentMetadata)),
  processing: Schema.optionalKey(Schema.Array(ProcessingMetadata)),
});

export type LibrarianResponse = typeof LibrarianResponse.Type;
