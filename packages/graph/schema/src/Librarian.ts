/**
 * Librarian service request/response schemas + document metadata types.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

import { TgError, Triple } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Librarian");

// ---------------------------------------------------------------------------
// Document / Processing metadata
// ---------------------------------------------------------------------------

/**
 * Metadata describing a document managed by the librarian service.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentMetadata extends S.Class<DocumentMetadata>($I`DocumentMetadata`)({
  id: S.String.annotateKey({
    description: "Stable document identifier.",
  }),
  time: S.Number.annotateKey({
    description: "Document timestamp encoded as a numeric epoch value.",
  }),
  kind: S.String.annotateKey({
    description: "High-level document kind or classification.",
  }),
  title: S.String.annotateKey({
    description: "Human-readable document title.",
  }),
  comments: S.String.annotateKey({
    description: "Free-form comments associated with the document.",
  }),
  user: S.String.annotateKey({
    description: "Owner or tenant for the document.",
  }),
  tags: S.Array(S.String).annotateKey({
    description: "Tags associated with the document.",
  }),
  parentId: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional parent document identifier for hierarchical documents.",
  }),
  documentType: S.String.annotateKey({
    description: "Specific document type used by downstream processors.",
  }),
  metadata: S.OptionFromOptionalKey(S.Array(Triple)).annotateKey({
    description: "Optional semantic metadata triples attached to the document.",
  }),
}, $I.annote("DocumentMetadata", {
  description: "Metadata describing a document managed by the librarian service.",
})) {}

/**
 * Metadata describing a librarian processing record.
 *
 * @since 0.1.0
 * @category models
 */
export class ProcessingMetadata extends S.Class<ProcessingMetadata>($I`ProcessingMetadata`)({
  id: S.String.annotateKey({
    description: "Stable processing record identifier.",
  }),
  documentId: S.String.annotateKey({
    description: "Identifier of the document being processed.",
  }),
  time: S.Number.annotateKey({
    description: "Processing timestamp encoded as a numeric epoch value.",
  }),
  flow: S.String.annotateKey({
    description: "Flow identifier responsible for the processing run.",
  }),
  user: S.String.annotateKey({
    description: "Owner or tenant for the processing run.",
  }),
  collection: S.String.annotateKey({
    description: "Collection identifier associated with the processing run.",
  }),
  tags: S.Array(S.String).annotateKey({
    description: "Tags associated with the processing run.",
  }),
}, $I.annote("ProcessingMetadata", {
  description: "Metadata describing a librarian processing record.",
})) {}

// ---------------------------------------------------------------------------
// Librarian request / response
// ---------------------------------------------------------------------------

/**
 * Librarian commands supported by the graph document service.
 *
 * @since 0.1.0
 * @category models
 */
export const LibrarianOperation = LiteralKit([
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
] as const).pipe(
  $I.annoteSchema("LibrarianOperation", {
    description: "Librarian commands supported by the graph document service.",
  }),
);

/**
 * Type for {@link LibrarianOperation}. {@inheritDoc LibrarianOperation}
 *
 * @category models
 * @since 0.1.0
 */
export type LibrarianOperation = typeof LibrarianOperation.Type;

const makeLibrarianRequest = <TOperation extends LibrarianOperation>(literal: S.Literal<TOperation>) =>
  S.Struct({
    operation: S.tag(literal.literal).annotateKey({
      description: "Librarian command to perform.",
    }),
    documentId: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional document identifier targeted by the command.",
    }),
    processingId: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional processing identifier targeted by the command.",
    }),
    documentMetadata: S.OptionFromOptionalKey(DocumentMetadata).annotateKey({
      description: "Optional document metadata supplied with write operations.",
    }),
    processingMetadata: S.OptionFromOptionalKey(ProcessingMetadata).annotateKey({
      description: "Optional processing metadata supplied with write operations.",
    }),
    content: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional document content payload used by content operations.",
    }),
    user: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional user or tenant scope for the command.",
    }),
    collection: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional collection identifier used to scope the command.",
    }),
  });

/**
 * Request payload for librarian document-management operations.
 *
 * @since 0.1.0
 * @category models
 */
export const LibrarianRequest = LibrarianOperation.mapMembers((members) =>
  pipe(
    members,
    Tuple.evolve([
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
      makeLibrarianRequest,
    ])
  )
).pipe(
  S.toTaggedUnion("operation"),
  $I.annoteSchema("LibrarianRequest", {
    description: "Request payload for librarian document-management operations.",
  }),
);

/**
 * Type for {@link LibrarianRequest}. {@inheritDoc LibrarianRequest}
 *
 * @category models
 * @since 0.1.0
 */
export type LibrarianRequest = typeof LibrarianRequest.Type;

/**
 * Response payload for librarian document-management operations.
 *
 * @since 0.1.0
 * @category models
 */
export class LibrarianResponse extends S.Class<LibrarianResponse>($I`LibrarianResponse`)({
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the librarian command fails.",
  }),
  documentMetadata: S.OptionFromOptionalKey(DocumentMetadata).annotateKey({
    description: "Document metadata returned by read operations.",
  }),
  content: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Document content returned by content retrieval operations.",
  }),
  documents: S.OptionFromOptionalKey(S.Array(DocumentMetadata)).annotateKey({
    description: "Document metadata entries returned by list operations.",
  }),
  processing: S.OptionFromOptionalKey(S.Array(ProcessingMetadata)).annotateKey({
    description: "Processing records returned by processing list operations.",
  }),
}, $I.annote("LibrarianResponse", {
  description: "Response payload for librarian document-management operations.",
})) {}
