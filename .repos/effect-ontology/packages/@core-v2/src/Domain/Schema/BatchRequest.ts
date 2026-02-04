import { Schema } from "effect"
import { BatchId, DocumentId, GcsUri, Namespace, OntologyVersion } from "../Identity.js"
import { defaultPreprocessingOptions, PreprocessingOptions } from "./DocumentMetadata.js"

// Re-export for backwards compatibility
export { defaultPreprocessingOptions, PreprocessingOptions }

export class BatchRequestDocument extends Schema.Class<BatchRequestDocument>("BatchRequestDocument")({
  sourceUri: GcsUri,
  contentType: Schema.String,
  sizeBytes: Schema.optional(Schema.Number),
  documentId: Schema.optional(DocumentId),
  /**
   * When the real-world event described in this document occurred
   *
   * For news articles, this is typically the event date (not publication date).
   * @example A news article about an earthquake might have eventTime of the earthquake date.
   */
  eventTime: Schema.optional(Schema.DateTimeUtc),
  /**
   * When the source document was published
   *
   * Publication date from the original source (newspaper, website, etc.).
   */
  publishedAt: Schema.optional(Schema.DateTimeUtc)
}) {}

export class BatchRequest extends Schema.Class<BatchRequest>("BatchRequest")({
  batchId: Schema.optional(BatchId),
  /** Ontology registry ID (e.g., "seattle") */
  ontologyId: Schema.String,
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  targetNamespace: Namespace,
  shaclUri: Schema.optional(GcsUri),
  /**
   * Pre-computed ontology embeddings URI (optional)
   *
   * When provided, the workflow uses pre-computed embeddings for semantic search
   * instead of computing embeddings on-the-fly. Significantly speeds up startup
   * for workflows processing many documents against the same ontology.
   *
   * Generate with `makeComputeEmbeddingsActivity()`.
   * If omitted, derived automatically from ontologyUri (ontology.ttl -> ontology-embeddings.json).
   */
  ontologyEmbeddingsUri: Schema.optional(GcsUri),
  documents: Schema.NonEmptyArray(BatchRequestDocument),
  /**
   * Preprocessing configuration (optional)
   *
   * When omitted, all preprocessing features are enabled with defaults.
   */
  preprocessing: Schema.optional(PreprocessingOptions)
}) {}
