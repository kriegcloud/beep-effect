/**
 * Schema: Batch Workflow payloads
 *
 * Strongly-typed manifests and activity inputs for the batch pipeline.
 * Uses branded IDs/URIs to keep Cloud Run job payloads validated at ingress.
 *
 * @since 2.0.0
 */

import { Schema } from "effect"
import { BatchId, DocumentId, GcsUri, Namespace, OntologyVersion } from "../Identity.js"
import { PreprocessingOptions } from "./BatchRequest.js"
import { ValidationPolicy } from "./Shacl.js"

// Re-export for backward compatibility
export { ValidationPolicy }

export class ManifestDocument extends Schema.Class<ManifestDocument>("ManifestDocument")({
  documentId: DocumentId,
  sourceUri: GcsUri,
  contentType: Schema.String,
  sizeBytes: Schema.Number
}) {}

export class BatchManifest extends Schema.Class<BatchManifest>("BatchManifest")({
  batchId: BatchId,
  /** Ontology registry ID (e.g., "seattle") */
  ontologyId: Schema.String,
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  shaclUri: Schema.optional(GcsUri),
  targetNamespace: Namespace,
  documents: Schema.Array(ManifestDocument),
  createdAt: Schema.DateTimeUtc,
  /**
   * Validation policy for controlling failure behavior based on severity.
   *
   * - failOnViolation: true (default) - Fail workflow if any Violation-level results found
   * - failOnWarning: false (default) - Do not fail on Warning-level results
   *
   * Set failOnViolation: false to allow ingestion of graphs with violations
   * (useful for development/debugging or when violations are acceptable).
   */
  validationPolicy: Schema.optional(ValidationPolicy)
}) {}

export class ExtractionActivityInput extends Schema.Class<ExtractionActivityInput>("ExtractionActivityInput")({
  batchId: BatchId,
  documentId: DocumentId,
  sourceUri: GcsUri,
  ontologyUri: GcsUri,
  /** Ontology registry ID for namespace scoping (e.g., "seattle") */
  ontologyId: Schema.String,
  /** Target namespace for entity IRI minting (from batch manifest) */
  targetNamespace: Namespace,
  /** Pre-computed ontology embeddings URI (optional, speeds up semantic search) */
  ontologyEmbeddingsUri: Schema.optional(GcsUri),

  // === Document metadata for provenance ===
  /**
   * When the real-world event described in the document occurred
   *
   * Inherited from DocumentMetadata.eventTime. Used to set Entity.eventTime.
   */
  eventTime: Schema.optional(Schema.DateTimeUtc),
  /**
   * When the source document was published
   *
   * Inherited from DocumentMetadata.publishedAt. Used for temporal queries.
   */
  publishedAt: Schema.optional(Schema.DateTimeUtc),
  /**
   * Document title (extracted or inferred)
   *
   * Useful for context in extraction prompts.
   */
  title: Schema.optional(Schema.String),
  /**
   * Document language (ISO 639-1)
   *
   * Helps with language-specific extraction.
   */
  language: Schema.optional(Schema.String)
}) {}

export class ResolutionActivityInput extends Schema.Class<ResolutionActivityInput>("ResolutionActivityInput")({
  batchId: BatchId,
  documentGraphUris: Schema.Array(GcsUri)
}) {}

export class ValidationActivityInput extends Schema.Class<ValidationActivityInput>("ValidationActivityInput")({
  batchId: BatchId,
  resolvedGraphUri: GcsUri,
  /** Ontology URI for generating SHACL shapes (when shaclUri not provided) */
  ontologyUri: GcsUri,
  shaclUri: Schema.optional(GcsUri),
  /** Policy for handling validation violations (default: failOnViolation=true) */
  validationPolicy: Schema.optional(ValidationPolicy)
}) {}

export class ValidationActivityViolationSummary
  extends Schema.Class<ValidationActivityViolationSummary>("ValidationActivityViolationSummary")({
    severity: Schema.String,
    count: Schema.Number,
    sampleMessages: Schema.Array(Schema.String)
  })
{}

export class ValidationActivityOutput extends Schema.Class<ValidationActivityOutput>("ValidationActivityOutput")({
  validatedUri: GcsUri,
  conforms: Schema.Boolean,
  violations: Schema.Number,
  violationSummary: Schema.optional(Schema.Array(ValidationActivityViolationSummary)),
  reportUri: GcsUri,
  durationMs: Schema.Number
}) {}

export class IngestionActivityInput extends Schema.Class<IngestionActivityInput>("IngestionActivityInput")({
  batchId: BatchId,
  validatedGraphUri: GcsUri,
  targetNamespace: Namespace
}) {}

export class BatchWorkflowPayload extends Schema.Class<BatchWorkflowPayload>("BatchWorkflowPayload")({
  batchId: BatchId,
  /** Ontology registry ID (e.g., "seattle") */
  ontologyId: Schema.String,
  manifestUri: GcsUri,
  ontologyVersion: OntologyVersion,
  ontologyUri: GcsUri,
  targetNamespace: Namespace,
  shaclUri: Schema.optional(GcsUri),
  documentIds: Schema.Array(DocumentId),
  /**
   * Pre-computed ontology embeddings URI (optional)
   *
   * When provided, the workflow uses pre-computed embeddings for semantic search
   * instead of computing embeddings on-the-fly. Significantly speeds up startup
   * for workflows processing many documents against the same ontology.
   *
   * Generate with `makeComputeEmbeddingsActivity()`.
   */
  ontologyEmbeddingsUri: Schema.optional(GcsUri),
  /**
   * Preprocessing configuration (optional)
   *
   * When omitted, all preprocessing features are enabled with defaults.
   */
  preprocessing: Schema.optional(PreprocessingOptions)
}) {}
