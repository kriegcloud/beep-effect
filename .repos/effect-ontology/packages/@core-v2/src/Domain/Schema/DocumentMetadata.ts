/**
 * Schema: Document Preprocessing Metadata
 *
 * Schemas for agentic document preprocessing: classification, chunking strategies,
 * and enriched manifests for intelligent batching.
 *
 * @since 2.3.0
 * @module Domain/Schema/DocumentMetadata
 */

import { Schema } from "effect"
import { BatchId, DocumentId, GcsUri, Namespace, OntologyVersion } from "../Identity.js"

// =============================================================================
// Classification Types
// =============================================================================

/**
 * Document type classification
 *
 * Used to select appropriate chunking strategies and processing pipelines.
 *
 * @since 2.3.0
 * @category Classification
 */
export const DocumentType = Schema.Literal(
  "article", // News articles, blog posts
  "transcript", // Meeting notes, interviews, conversations
  "report", // Technical reports, whitepapers, research papers
  "contract", // Legal documents, agreements
  "correspondence", // Emails, letters, memos
  "reference", // Wikipedia, encyclopedic content
  "narrative", // Stories, descriptions, prose
  "structured", // Tables, lists, forms, CSV-like content
  "unknown" // Fallback when classification fails
).annotations({
  title: "Document Type",
  description: "Classification of document structure and purpose"
})
export type DocumentType = typeof DocumentType.Type

/**
 * Entity density estimation
 *
 * Guides chunk size selection - dense documents need smaller chunks
 * for better entity extraction accuracy.
 *
 * @since 2.3.0
 * @category Classification
 */
export const EntityDensity = Schema.Literal(
  "sparse", // Few entities, mostly narrative prose
  "moderate", // Average entity density
  "dense" // Many entities per sentence (e.g., sports rosters, financial reports)
).annotations({
  title: "Entity Density",
  description: "Estimated entity density for chunk size optimization"
})
export type EntityDensity = typeof EntityDensity.Type

/**
 * Chunking strategy selection
 *
 * Determines how documents are split for processing.
 * Each strategy optimizes for different document structures.
 *
 * @since 2.3.0
 * @category Chunking
 */
export const ChunkingStrategy = Schema.Literal(
  "standard", // Default: ~500 chars, 2 sentence overlap
  "fine_grained", // Dense content: ~300 chars, 3 sentence overlap
  "high_overlap", // Complex content: ~400 chars, 4 sentence overlap
  "section_aware", // Contracts/reports: respect section headers
  "speaker_aware", // Transcripts: respect speaker turns
  "paragraph_based" // Articles: use natural paragraph breaks
).annotations({
  title: "Chunking Strategy",
  description: "Strategy for splitting document into chunks"
})
export type ChunkingStrategy = typeof ChunkingStrategy.Type

// =============================================================================
// Chunking Parameters
// =============================================================================

/**
 * Parameters for a chunking strategy
 *
 * @since 2.3.0
 * @category Chunking
 */
export class ChunkingParams extends Schema.Class<ChunkingParams>("ChunkingParams")({
  /** Target chunk size in characters */
  chunkSize: Schema.Number.pipe(
    Schema.greaterThan(0),
    Schema.lessThanOrEqualTo(10000)
  ),
  /** Number of sentences to overlap between chunks */
  overlapSentences: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(10)
  ),
  /** Whether to preserve sentence boundaries */
  preserveSentences: Schema.optional(Schema.Boolean)
}) {}

/**
 * Default chunking parameters by strategy
 *
 * @since 2.3.0
 * @category Chunking
 */
export const defaultChunkingParams: Record<ChunkingStrategy, ChunkingParams> = {
  standard: new ChunkingParams({ chunkSize: 500, overlapSentences: 2, preserveSentences: true }),
  fine_grained: new ChunkingParams({ chunkSize: 300, overlapSentences: 3, preserveSentences: true }),
  high_overlap: new ChunkingParams({ chunkSize: 400, overlapSentences: 4, preserveSentences: true }),
  section_aware: new ChunkingParams({ chunkSize: 800, overlapSentences: 1, preserveSentences: true }),
  speaker_aware: new ChunkingParams({ chunkSize: 1000, overlapSentences: 3, preserveSentences: false }),
  paragraph_based: new ChunkingParams({ chunkSize: 600, overlapSentences: 2, preserveSentences: true })
}

// =============================================================================
// Preprocessing Options
// =============================================================================

/**
 * Preprocessing options for batch extraction
 *
 * Controls document preprocessing behavior including classification,
 * adaptive chunking, and priority ordering.
 *
 * @since 2.3.0
 * @category Preprocessing
 */
export class PreprocessingOptions extends Schema.Class<PreprocessingOptions>("PreprocessingOptions")({
  /**
   * Enable preprocessing stage (default: true)
   *
   * When false, skips preprocessing entirely and uses default chunking.
   */
  enabled: Schema.optionalWith(Schema.Boolean, { default: () => true }),

  /**
   * Enable LLM-based document classification (default: true)
   *
   * When false, documents are assigned default metadata.
   * Disabling saves LLM costs but loses adaptive chunking benefits.
   */
  classifyDocuments: Schema.optionalWith(Schema.Boolean, { default: () => true }),

  /**
   * Enable adaptive chunking based on document type (default: true)
   *
   * When false, uses standard chunking strategy for all documents.
   */
  adaptiveChunking: Schema.optionalWith(Schema.Boolean, { default: () => true }),

  /**
   * Enable priority-based document ordering (default: true)
   *
   * When false, processes documents in original order.
   * Priority ordering processes simpler documents first for faster feedback.
   */
  priorityOrdering: Schema.optionalWith(Schema.Boolean, { default: () => true }),

  /**
   * Override chunking strategy for all documents (default: undefined)
   *
   * When set, ignores adaptive chunking and uses this strategy for all docs.
   * Useful for testing or when document types are known in advance.
   */
  chunkingStrategyOverride: Schema.optional(ChunkingStrategy),

  /**
   * Maximum documents to classify per LLM call (default: 10)
   *
   * Higher values reduce LLM calls but may hit token limits.
   */
  classificationBatchSize: Schema.optionalWith(
    Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThanOrEqualTo(50)),
    { default: () => 10 }
  )
}) {}

/**
 * Default preprocessing options
 *
 * @since 2.3.0
 * @category Preprocessing
 */
export const defaultPreprocessingOptions: PreprocessingOptions = new PreprocessingOptions({
  enabled: true,
  classifyDocuments: true,
  adaptiveChunking: true,
  priorityOrdering: true,
  chunkingStrategyOverride: undefined,
  classificationBatchSize: 10
})

// =============================================================================
// Document Metadata
// =============================================================================

/**
 * ISO 639-1 language code
 *
 * @since 2.3.0
 * @category Classification
 */
export const LanguageCode = Schema.String.pipe(
  Schema.pattern(/^[a-z]{2}$/),
  Schema.brand("LanguageCode"),
  Schema.annotations({
    title: "Language Code",
    description: "ISO 639-1 two-letter language code (e.g., 'en', 'es')"
  })
)
export type LanguageCode = typeof LanguageCode.Type

/**
 * Complexity score (0-1 scale)
 *
 * @since 2.3.0
 * @category Classification
 */
export const ComplexityScore = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.lessThanOrEqualTo(1),
  Schema.annotations({
    title: "Complexity Score",
    description: "Document complexity on 0-1 scale (higher = more complex)"
  })
)
export type ComplexityScore = typeof ComplexityScore.Type

/**
 * Document metadata from preprocessing
 *
 * Extends the basic ManifestDocument with classification results
 * and chunking strategy recommendations.
 *
 * @since 2.3.0
 * @category Metadata
 */
export class DocumentMetadata extends Schema.Class<DocumentMetadata>("DocumentMetadata")({
  // === Original ManifestDocument fields ===
  /** Unique document identifier */
  documentId: DocumentId,
  /** Source URI in cloud storage */
  sourceUri: GcsUri,
  /** MIME content type */
  contentType: Schema.String,
  /** Document size in bytes */
  sizeBytes: Schema.Number,

  // === Bitemporal timestamps ===
  /**
   * When the real-world event described in this document occurred
   *
   * For news articles, this is typically the event date (not publication date).
   */
  eventTime: Schema.optional(Schema.DateTimeUtc),
  /**
   * When the source document was published
   *
   * Publication date from the original source (newspaper, website, etc.).
   */
  publishedAt: Schema.optional(Schema.DateTimeUtc),
  /**
   * When this document was ingested into the system
   *
   * Auto-set during preprocessing. Used for temporal queries and audit trails.
   */
  ingestedAt: Schema.DateTimeUtc,
  // === Preprocessing timestamp ===
  /** When preprocessing was performed */
  preprocessedAt: Schema.DateTimeUtc,

  // === Basic extraction (always populated) ===
  /** Extracted or inferred document title */
  title: Schema.optional(Schema.String),
  /** Detected language (ISO 639-1) */
  language: LanguageCode,
  /** Estimated token count for LLM processing */
  estimatedTokens: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),

  // === LLM Classification results ===
  /** Document type classification */
  documentType: DocumentType,
  /** Domain/topic tags extracted from content */
  domainTags: Schema.Array(Schema.String),
  /** Complexity score (0-1) */
  complexityScore: ComplexityScore,
  /** Estimated entity density */
  entityDensityHint: EntityDensity,

  // === Chunking strategy (derived from classification) ===
  /** Selected chunking strategy */
  chunkingStrategy: ChunkingStrategy,
  /** Suggested chunk size in characters */
  suggestedChunkSize: Schema.Number.pipe(Schema.greaterThan(0)),
  /** Suggested sentence overlap count */
  suggestedOverlap: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),

  // === Batch optimization ===
  /** Processing priority (lower = process first) */
  priority: Schema.Number,
  /** Estimated LLM cost for extraction (token estimate) */
  estimatedExtractionCost: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0))
}) {}

// =============================================================================
// Preprocessing Stats
// =============================================================================

/**
 * Aggregated statistics from preprocessing
 *
 * @since 2.3.0
 * @category Stats
 */
export class PreprocessingStats extends Schema.Class<PreprocessingStats>("PreprocessingStats")({
  /** Total documents in batch */
  totalDocuments: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  /** Documents successfully classified */
  classifiedCount: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  /** Documents that failed classification (used defaults) */
  failedCount: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  /** Total estimated tokens across all documents */
  totalEstimatedTokens: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  /** Preprocessing duration in milliseconds */
  preprocessingDurationMs: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  /** Average complexity score across documents */
  averageComplexity: ComplexityScore,
  /** Distribution of document types */
  documentTypeDistribution: Schema.Record({ key: Schema.String, value: Schema.Number })
}) {}

// =============================================================================
// Enriched Manifest
// =============================================================================

/**
 * Enriched batch manifest with preprocessing metadata
 *
 * Extends BatchManifest by replacing ManifestDocument[] with DocumentMetadata[]
 * and adding preprocessing statistics.
 *
 * @since 2.3.0
 * @category Manifest
 */
export class EnrichedManifest extends Schema.Class<EnrichedManifest>("EnrichedManifest")({
  /** Batch identifier */
  batchId: BatchId,
  /** Ontology URI for extraction */
  ontologyUri: GcsUri,
  /** Ontology version string */
  ontologyVersion: OntologyVersion,
  /** Optional SHACL shapes URI */
  shaclUri: Schema.optional(GcsUri),
  /** Target namespace for extracted entities */
  targetNamespace: Namespace,
  /** Enriched document metadata (sorted by priority) */
  documents: Schema.Array(DocumentMetadata),
  /** Original manifest creation time */
  createdAt: Schema.DateTimeUtc,
  /** Preprocessing completion time */
  preprocessedAt: Schema.DateTimeUtc,
  /** Aggregated preprocessing statistics */
  preprocessingStats: PreprocessingStats
}) {}

// =============================================================================
// Preprocessing Activity I/O
// =============================================================================

/**
 * Input for preprocessing activity
 *
 * @since 2.3.0
 * @category Activity
 */
export class PreprocessingActivityInput extends Schema.Class<PreprocessingActivityInput>("PreprocessingActivityInput")({
  /** Batch identifier */
  batchId: BatchId,
  /** URI of the original manifest */
  manifestUri: GcsUri,
  /**
   * Preprocessing options from the batch request
   *
   * Controls classification, chunking, and priority ordering behavior.
   * When omitted, defaults are applied (all features enabled).
   */
  preprocessing: Schema.optional(PreprocessingOptions),
  /**
   * @deprecated Use `preprocessing.classifyDocuments` instead
   * Optional: skip classification (use defaults)
   */
  skipClassification: Schema.optional(Schema.Boolean)
}) {}

/**
 * Output from preprocessing activity
 *
 * @since 2.3.0
 * @category Activity
 */
export class PreprocessingActivityOutput
  extends Schema.Class<PreprocessingActivityOutput>("PreprocessingActivityOutput")({
    /** URI of the enriched manifest */
    enrichedManifestUri: GcsUri,
    /** Preprocessing statistics */
    stats: PreprocessingStats,
    /** Duration in milliseconds */
    durationMs: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0))
  })
{}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Select chunking strategy based on classification
 *
 * @since 2.3.0
 * @category Helpers
 */
export const selectChunkingStrategy = (
  documentType: DocumentType,
  entityDensity: EntityDensity,
  complexity: number
): { strategy: ChunkingStrategy; chunkSize: number; overlap: number } => {
  // Document type takes precedence
  if (documentType === "transcript") {
    return { strategy: "speaker_aware", chunkSize: 1000, overlap: 3 }
  }
  if (documentType === "contract") {
    return { strategy: "section_aware", chunkSize: 800, overlap: 1 }
  }
  if (documentType === "article" || documentType === "narrative") {
    return { strategy: "paragraph_based", chunkSize: 600, overlap: 2 }
  }

  // Entity density for other document types
  if (entityDensity === "dense") {
    return { strategy: "fine_grained", chunkSize: 300, overlap: 3 }
  }

  // Complexity fallback
  if (complexity > 0.8) {
    return { strategy: "high_overlap", chunkSize: 400, overlap: 4 }
  }

  // Default strategy
  return { strategy: "standard", chunkSize: 500, overlap: 2 }
}

/**
 * Compute processing priority for batch ordering
 *
 * Lower priority = process first (simple/small documents first for fail-fast)
 *
 * @since 2.3.0
 * @category Helpers
 */
export const computePriority = (
  complexityScore: number,
  estimatedTokens: number,
  entityDensity: EntityDensity
): number => {
  let priority = 50 // Base priority

  // Simple documents first (fail fast on easy wins)
  priority -= (1 - complexityScore) * 20

  // Smaller documents first
  if (estimatedTokens < 1000) priority -= 10
  if (estimatedTokens > 10000) priority += 10

  // Sparse entity density is faster to process
  if (entityDensity === "sparse") priority -= 5
  if (entityDensity === "dense") priority += 5

  return Math.round(priority)
}

/**
 * Estimate token count from character count
 *
 * Uses ~4 characters per token heuristic (common for English text)
 *
 * @since 2.3.0
 * @category Helpers
 */
export const estimateTokens = (charCount: number): number => Math.ceil(charCount / 4)

/**
 * Create default DocumentMetadata when classification fails
 *
 * @since 2.3.0
 * @category Helpers
 */
export const defaultDocumentMetadata = (
  documentId: DocumentId,
  sourceUri: GcsUri,
  contentType: string,
  sizeBytes: number,
  preprocessedAt: Date,
  ingestedAt?: Date
): Omit<DocumentMetadata, "preprocessedAt" | "ingestedAt"> & { preprocessedAt: Date; ingestedAt: Date } => ({
  documentId,
  sourceUri,
  contentType,
  sizeBytes,
  eventTime: undefined,
  publishedAt: undefined,
  ingestedAt: ingestedAt ?? preprocessedAt,
  preprocessedAt,
  title: undefined,
  language: "en" as LanguageCode,
  estimatedTokens: estimateTokens(sizeBytes),
  documentType: "unknown",
  domainTags: [],
  complexityScore: 0.5,
  entityDensityHint: "moderate",
  chunkingStrategy: "standard",
  suggestedChunkSize: 500,
  suggestedOverlap: 2,
  priority: 50,
  estimatedExtractionCost: estimateTokens(sizeBytes) * 2 // Rough estimate
})
