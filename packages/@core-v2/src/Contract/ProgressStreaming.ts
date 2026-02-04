/**
 * Progress Streaming Contract for Extractions
 *
 * Defines the complete contract for streaming extraction progress from the orchestrator
 * through RPC to WebSocket clients. Includes progress event schemas, backpressure
 * strategy, error semantics, and cancellation semantics.
 *
 * Architecture:
 * 1. Orchestrator emits Stream<ProgressEvent>
 * 2. RPC layer transforms to Stream<ProgressMessage> (JSON-serializable)
 * 3. WebSocket layer handles backpressure and transmission
 * 4. Client subscribes to MessageEvent stream
 *
 * @since 2.0.0
 * @module Contract/ProgressStreaming
 */

import { Schema } from "effect"

// =============================================================================
// Progress Event Tags (Discriminated Union)
// =============================================================================

/**
 * All possible progress event types in the extraction pipeline
 */
export const ProgressEventTag = Schema.Literal(
  "extraction_started",
  "chunking_started",
  "chunking_progress",
  "chunking_complete",
  "chunk_processing_started",
  "mention_extraction_progress",
  "entity_extraction_progress",
  "relation_extraction_progress",
  "grounding_progress",
  "chunk_processing_complete",
  "entity_found",
  "relation_found",
  "extraction_complete",
  "extraction_failed",
  "extraction_cancelled",
  "backpressure_warning",
  "error_recoverable",
  "error_fatal",
  // Generic stage lifecycle events (used by ExtractionEntityHandler)
  "stage_started",
  "stage_progress",
  "stage_completed",
  "rate_limited"
)

export type ProgressEventTag = Schema.Schema.Type<typeof ProgressEventTag>

// =============================================================================
// Common Field Schemas
// =============================================================================

/**
 * Extraction run identifier
 */
const ExtractionRunId = Schema.String.pipe(
  Schema.pattern(/^doc-[a-f0-9]{12}$/),
  Schema.annotations({
    title: "Extraction Run ID",
    description: "Hash-based document ID: doc-{first12hexchars}"
  })
)

/**
 * Timestamp (ISO 8601)
 */
const Timestamp = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/),
  Schema.annotations({
    title: "Timestamp",
    description: "ISO 8601 timestamp"
  })
)

/**
 * Confidence score (0.0 to 1.0)
 */
const Confidence = Schema.Number.pipe(
  Schema.between(0, 1),
  Schema.annotations({
    title: "Confidence",
    description: "Confidence score between 0 and 1"
  })
)

/**
 * Progress percentage (0-100)
 */
const ProgressPercentage = Schema.Number.pipe(
  Schema.int(),
  Schema.between(0, 100),
  Schema.annotations({
    title: "Progress",
    description: "Progress percentage (0-100)"
  })
)

// =============================================================================
// Progress Event Schemas
// =============================================================================

/**
 * Base progress event - common fields for all events
 */
const BaseProgressEvent = Schema.Struct({
  /**
   * Unique event ID for tracking (for deduplication if needed)
   */
  eventId: Schema.String.annotations({
    title: "Event ID",
    description: "Unique identifier for this event (UUID v4)"
  }),

  /**
   * Extraction run identifier
   */
  runId: ExtractionRunId,

  /**
   * Event timestamp (server time)
   */
  timestamp: Timestamp,

  /**
   * Overall extraction progress (0-100)
   */
  overallProgress: ProgressPercentage
})

/**
 * Extraction Started
 *
 * Emitted once at extraction start
 */
export class ExtractionStartedEvent extends Schema.Class<ExtractionStartedEvent>(
  "ExtractionStartedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("extraction_started"),

  /**
   * Total number of chunks that will be processed
   */
  totalChunks: Schema.Number.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.annotations({
      title: "Total Chunks",
      description: "Total chunks for this extraction"
    })
  ),

  /**
   * Text statistics for context
   */
  textMetadata: Schema.Struct({
    /**
     * Total text length in characters
     */
    characterCount: Schema.Number.pipe(Schema.int(), Schema.positive()),

    /**
     * Estimated average chunk size
     */
    estimatedAvgChunkSize: Schema.Number.pipe(Schema.int(), Schema.positive()),

    /**
     * Content type or category (optional)
     */
    contentType: Schema.optional(Schema.String)
  }).annotations({
    title: "Text Metadata",
    description: "Statistics about the source text"
  })
}) {}

/**
 * Chunking Started
 *
 * Emitted when NLP service begins text chunking
 */
export class ChunkingStartedEvent extends Schema.Class<ChunkingStartedEvent>(
  "ChunkingStartedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("chunking_started"),

  /**
   * Chunking configuration
   */
  config: Schema.Struct({
    maxChunkSize: Schema.Number.pipe(Schema.int(), Schema.positive()),
    preserveSentences: Schema.Boolean
  }).annotations({
    title: "Chunking Config",
    description: "Configuration for text chunking"
  })
}) {}

/**
 * Chunking Progress
 *
 * Emitted periodically during chunking
 */
export class ChunkingProgressEvent extends Schema.Class<ChunkingProgressEvent>(
  "ChunkingProgressEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("chunking_progress"),

  /**
   * Chunks completed so far
   */
  chunksCompleted: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Chunks being processed (estimated)
   */
  chunksProcessing: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Average chunk size processed
   */
  avgChunkSize: Schema.Number.pipe(Schema.int(), Schema.positive())
}) {}

/**
 * Chunking Complete
 *
 * Emitted when text chunking finishes
 */
export class ChunkingCompleteEvent extends Schema.Class<ChunkingCompleteEvent>(
  "ChunkingCompleteEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("chunking_complete"),

  /**
   * Final chunk count (may differ from estimate)
   */
  finalChunkCount: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Actual average chunk size
   */
  actualAvgChunkSize: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Time taken in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.int(), Schema.positive())
}) {}

/**
 * Chunk Processing Started
 *
 * Emitted when a chunk begins full pipeline processing
 */
export class ChunkProcessingStartedEvent extends Schema.Class<ChunkProcessingStartedEvent>(
  "ChunkProcessingStartedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("chunk_processing_started"),

  /**
   * Index of the chunk being processed
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Length of this chunk's text
   */
  chunkTextLength: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Preview of chunk text (first N chars)
   */
  textPreview: Schema.String.pipe(
    Schema.maxLength(200),
    Schema.annotations({
      title: "Text Preview",
      description: "First 200 chars of chunk text"
    })
  )
}) {}

/**
 * Mention Extraction Progress
 *
 * Emitted during mention extraction phase
 */
export class MentionExtractionProgressEvent extends Schema.Class<MentionExtractionProgressEvent>(
  "MentionExtractionProgressEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("mention_extraction_progress"),

  /**
   * Current chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Phase progress within chunk (0-100)
   */
  phaseProgress: ProgressPercentage,

  /**
   * Mentions found so far
   */
  mentionCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {}

/**
 * Entity Extraction Progress
 *
 * Emitted during entity extraction phase
 */
export class EntityExtractionProgressEvent extends Schema.Class<EntityExtractionProgressEvent>(
  "EntityExtractionProgressEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("entity_extraction_progress"),

  /**
   * Current chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Phase progress within chunk (0-100)
   */
  phaseProgress: ProgressPercentage,

  /**
   * Entities extracted so far in this chunk
   */
  entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Candidate classes used
   */
  candidateClassCount: Schema.Number.pipe(Schema.int(), Schema.positive())
}) {}

/**
 * Entity Found
 *
 * Emitted when a significant entity is extracted (optional sampling)
 */
export class EntityFoundEvent extends Schema.Class<EntityFoundEvent>(
  "EntityFoundEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("entity_found"),

  /**
   * Current chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Entity ID
   */
  entityId: Schema.String,

  /**
   * Entity mention from text
   */
  mention: Schema.String,

  /**
   * Ontology types
   */
  types: Schema.Array(Schema.String),

  /**
   * Extraction confidence (if available)
   */
  confidence: Schema.optional(Confidence)
}) {}

/**
 * Relation Extraction Progress
 *
 * Emitted during relation extraction phase
 */
export class RelationExtractionProgressEvent extends Schema.Class<RelationExtractionProgressEvent>(
  "RelationExtractionProgressEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("relation_extraction_progress"),

  /**
   * Current chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Phase progress within chunk (0-100)
   */
  phaseProgress: ProgressPercentage,

  /**
   * Relations extracted so far in this chunk
   */
  relationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Entities available for relations
   */
  entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {}

/**
 * Relation Found
 *
 * Emitted when a significant relation is extracted (optional sampling)
 */
export class RelationFoundEvent extends Schema.Class<RelationFoundEvent>(
  "RelationFoundEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("relation_found"),

  /**
   * Current chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Subject entity ID
   */
  subjectId: Schema.String,

  /**
   * Predicate IRI
   */
  predicate: Schema.String,

  /**
   * Object (entity ID or literal)
   */
  object: Schema.Union(Schema.String, Schema.Number, Schema.Boolean),

  /**
   * Is this object an entity reference?
   */
  isEntityReference: Schema.Boolean,

  /**
   * Extraction confidence (if available)
   */
  confidence: Schema.optional(Confidence)
}) {}

/**
 * Grounding Progress
 *
 * Emitted during relation verification phase
 */
export class GroundingProgressEvent extends Schema.Class<GroundingProgressEvent>(
  "GroundingProgressEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("grounding_progress"),

  /**
   * Current chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Relations verified so far
   */
  verifiedRelations: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Relations passing grounding threshold
   */
  groundedRelations: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Grounding confidence threshold
   */
  confidenceThreshold: Confidence
}) {}

/**
 * Chunk Processing Complete
 *
 * Emitted when a chunk finishes all extraction phases
 */
export class ChunkProcessingCompleteEvent extends Schema.Class<ChunkProcessingCompleteEvent>(
  "ChunkProcessingCompleteEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("chunk_processing_complete"),

  /**
   * Chunk index that completed
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Entities extracted from this chunk
   */
  entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Relations extracted from this chunk
   */
  relationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Processing time in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Any errors during processing (non-fatal)
   */
  errors: Schema.optional(
    Schema.Array(
      Schema.Struct({
        phase: Schema.String,
        message: Schema.String
      })
    )
  )
}) {}

/**
 * Extraction Complete
 *
 * Emitted when all chunks processed and merged successfully
 */
export class ExtractionCompleteEvent extends Schema.Class<ExtractionCompleteEvent>(
  "ExtractionCompleteEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("extraction_complete"),

  /**
   * Total entities in final KnowledgeGraph
   */
  totalEntities: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Total relations in final KnowledgeGraph
   */
  totalRelations: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Unique entity types
   */
  uniqueEntityTypes: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Total time for entire extraction in milliseconds
   */
  totalDurationMs: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Number of chunks successfully processed
   */
  successfulChunks: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Number of chunks that failed (if any)
   */
  failedChunks: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {}

/**
 * Extraction Failed
 *
 * Emitted when extraction encounters a fatal error
 * (Systemic error that cannot be recovered)
 */
export class ExtractionFailedEvent extends Schema.Class<ExtractionFailedEvent>(
  "ExtractionFailedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("extraction_failed"),

  /**
   * Error type (ExtractionError, LlmTimeout, LlmRateLimit, etc.)
   */
  errorType: Schema.String,

  /**
   * Human-readable error message
   */
  errorMessage: Schema.String,

  /**
   * Is error recoverable? (for client decision-making)
   */
  isRecoverable: Schema.Boolean,

  /**
   * Suggested retry strategy if recoverable
   */
  retryStrategy: Schema.optional(
    Schema.Struct({
      type: Schema.Literal("exponential_backoff", "fixed_delay", "none"),
      delayMs: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
      maxAttempts: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive()))
    })
  ),

  /**
   * Partial results (entities/relations extracted before failure)
   */
  partialResults: Schema.optional(
    Schema.Struct({
      entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
      relationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
      processedChunks: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
    })
  ),

  /**
   * Last successful chunk index (for resumption)
   */
  lastSuccessfulChunkIndex: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.nonNegative()))
}) {}

/**
 * Extraction Cancelled
 *
 * Emitted when extraction is cancelled by client request
 */
export class ExtractionCancelledEvent extends Schema.Class<ExtractionCancelledEvent>(
  "ExtractionCancelledEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("extraction_cancelled"),

  /**
   * Reason for cancellation
   */
  reason: Schema.String,

  /**
   * Partial results (entities/relations extracted before cancellation)
   */
  partialResults: Schema.optional(
    Schema.Struct({
      entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
      relationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
      processedChunks: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
    })
  ),

  /**
   * Last processed chunk index
   */
  lastProcessedChunkIndex: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.nonNegative()))
}) {}

/**
 * Backpressure Warning
 *
 * Emitted when server-side event queue is building up
 * Client should slow down consumption or risk dropped events
 */
export class BackpressureWarningEvent extends Schema.Class<BackpressureWarningEvent>(
  "BackpressureWarningEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("backpressure_warning"),

  /**
   * Number of events queued on server
   */
  queuedEvents: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Maximum queue size before dropping
   */
  maxQueueSize: Schema.Number.pipe(Schema.int(), Schema.positive()),

  /**
   * Severity level
   */
  severity: Schema.Literal("warning", "critical"),

  /**
   * Recommended action
   */
  recommendedAction: Schema.String.annotations({
    title: "Recommended Action",
    description: "Suggest client slow down consumption or increase parallelism"
  })
}) {}

/**
 * Recoverable Error
 *
 * Emitted when a non-fatal error occurs (chunk-level error, not systemic)
 * Extraction continues, but this chunk may produce partial results
 */
export class RecoverableErrorEvent extends Schema.Class<RecoverableErrorEvent>(
  "RecoverableErrorEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("error_recoverable"),

  /**
   * Affected chunk index
   */
  chunkIndex: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Error type
   */
  errorType: Schema.String,

  /**
   * Error message
   */
  errorMessage: Schema.String,

  /**
   * Phase where error occurred
   */
  phase: Schema.String.annotations({
    title: "Phase",
    description: "Pipeline phase (mention-extraction, entity-extraction, etc.)"
  }),

  /**
   * Recovery action taken
   */
  recoveryAction: Schema.String.annotations({
    title: "Recovery Action",
    description: "How the error was handled (skip chunk, use fallback, etc.)"
  })
}) {}

/**
 * Fatal Error
 *
 * Emitted when a systemic error occurs that halts extraction
 */
export class FatalErrorEvent extends Schema.Class<FatalErrorEvent>("FatalErrorEvent")({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("error_fatal"),

  /**
   * Error type (LlmTimeout, LlmRateLimit, DatabaseConnection, etc.)
   */
  errorType: Schema.String,

  /**
   * Error message
   */
  errorMessage: Schema.String,

  /**
   * Is error temporary (e.g., rate limit)? Client may retry later.
   */
  isTemporary: Schema.Boolean,

  /**
   * Partial results before failure
   */
  partialResults: Schema.optional(
    Schema.Struct({
      entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
      relationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
      processedChunks: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
    })
  ),

  /**
   * Suggested wait time before retry (for rate limits)
   */
  retryAfterMs: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive()))
}) {}

// =============================================================================
// Generic Stage Lifecycle Events (used by ExtractionEntityHandler)
// =============================================================================

/**
 * Stage type for generic lifecycle events
 */
const StageType = Schema.Literal(
  "chunking",
  "entity_extraction",
  "relation_extraction",
  "grounding",
  "serialization"
)

/**
 * Stage Started
 *
 * Emitted when a processing stage begins
 */
export class StageStartedEvent extends Schema.Class<StageStartedEvent>(
  "StageStartedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("stage_started"),

  /**
   * Name of the stage starting
   */
  stage: StageType
}) {}

/**
 * Stage Progress
 *
 * Emitted periodically during stage processing
 */
export class StageProgressEvent extends Schema.Class<StageProgressEvent>(
  "StageProgressEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("stage_progress"),

  /**
   * Name of the stage
   */
  stage: StageType,

  /**
   * Percentage complete (0-100)
   */
  percent: ProgressPercentage,

  /**
   * Items processed so far
   */
  itemsProcessed: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Total items to process
   */
  itemsTotal: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {}

/**
 * Stage Completed
 *
 * Emitted when a processing stage finishes
 */
export class StageCompletedEvent extends Schema.Class<StageCompletedEvent>(
  "StageCompletedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("stage_completed"),

  /**
   * Name of the stage that completed
   */
  stage: StageType,

  /**
   * Duration in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Number of items processed
   */
  itemCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {}

/**
 * Rate Limited
 *
 * Emitted when an operation is delayed due to rate limiting
 */
export class RateLimitedEvent extends Schema.Class<RateLimitedEvent>(
  "RateLimitedEvent"
)({
  ...BaseProgressEvent.fields,
  _tag: Schema.Literal("rate_limited"),

  /**
   * Time to wait in milliseconds
   */
  waitMs: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Reason for rate limit
   */
  reason: Schema.Literal("tokens", "requests", "concurrent")
}) {}

// =============================================================================
// Union Type: All Progress Events
// =============================================================================

/**
 * ProgressEvent - Discriminated union of all event types
 *
 * Can be used to handle any progress event from extraction pipeline.
 *
 * @example
 * ```typescript
 * const event: ProgressEvent = ...
 * if (event._tag === "entity_found") {
 *   console.log(`Found: ${event.mention}`)
 * }
 * ```
 */
export const ProgressEventSchema = Schema.Union(
  ExtractionStartedEvent,
  ChunkingStartedEvent,
  ChunkingProgressEvent,
  ChunkingCompleteEvent,
  ChunkProcessingStartedEvent,
  MentionExtractionProgressEvent,
  EntityExtractionProgressEvent,
  EntityFoundEvent,
  RelationExtractionProgressEvent,
  RelationFoundEvent,
  GroundingProgressEvent,
  ChunkProcessingCompleteEvent,
  ExtractionCompleteEvent,
  ExtractionFailedEvent,
  ExtractionCancelledEvent,
  BackpressureWarningEvent,
  RecoverableErrorEvent,
  FatalErrorEvent,
  // Generic stage lifecycle events
  StageStartedEvent,
  StageProgressEvent,
  StageCompletedEvent,
  RateLimitedEvent
)

export type ProgressEvent = Schema.Schema.Type<typeof ProgressEventSchema>

// =============================================================================
// Backpressure Strategy
// =============================================================================

/**
 * Backpressure Configuration
 *
 * Defines how the orchestrator handles client slow-down scenarios.
 * This is NOT part of the event contract but is essential infrastructure.
 */
export interface BackpressureConfig {
  /**
   * Maximum number of events queued before applying backpressure
   */
  readonly maxQueueSize: number

  /**
   * When queue exceeds this threshold, emit a warning (0.0-1.0 of maxQueueSize)
   */
  readonly warningThreshold: number

  /**
   * Strategy for handling overflow
   */
  readonly strategy: "drop_oldest" | "drop_newest" | "block_producer" | "close_stream"

  /**
   * If using "block_producer", how long to block (ms) before applying strategy
   */
  readonly blockTimeoutMs?: number

  /**
   * Sample rate for detailed events (0.0-1.0)
   * - entity_found, relation_found emitted for this fraction of items
   * - Always emit status events (started, progress, complete, failed)
   */
  readonly detailedEventSampleRate: number
}

/**
 * Default backpressure config
 *
 * - 1000 events max queue
 * - Warn at 80% full
 * - Drop oldest events when full
 * - Sample detailed events at 10% (1 in 10 items)
 */
export const DefaultBackpressureConfig: BackpressureConfig = {
  maxQueueSize: 1000,
  warningThreshold: 0.8,
  strategy: "drop_oldest",
  detailedEventSampleRate: 0.1
}

// =============================================================================
// Cancellation Semantics
// =============================================================================

/**
 * Cancellation Request
 *
 * Client sends this to cancel an ongoing extraction
 */
export class CancellationRequest extends Schema.Class<CancellationRequest>(
  "CancellationRequest"
)({
  /**
   * Run ID to cancel
   */
  runId: ExtractionRunId,

  /**
   * Reason for cancellation (optional)
   */
  reason: Schema.optional(Schema.String),

  /**
   * Should server attempt to save partial results?
   */
  savePartialResults: Schema.optional(Schema.Boolean)
}) {}

/**
 * Cancellation Response
 *
 * Server confirms cancellation request received
 */
export class CancellationResponse extends Schema.Class<CancellationResponse>(
  "CancellationResponse"
)({
  /**
   * Run ID that was cancelled
   */
  runId: ExtractionRunId,

  /**
   * Was cancellation accepted?
   */
  accepted: Schema.Boolean,

  /**
   * Reason if not accepted
   */
  rejectionReason: Schema.optional(Schema.String),

  /**
   * Timestamp of response
   */
  timestamp: Timestamp
}) {}

// =============================================================================
// Error Recovery Contract
// =============================================================================

/**
 * Error Recovery Semantics
 *
 * Describes how clients should handle different error scenarios.
 */
export interface ErrorRecoverySemantics {
  /**
   * Systemic Errors (LlmTimeout, LlmRateLimit, DatabaseConnection, etc.)
   *
   * - Emit ExtractionFailedEvent with isRecoverable = true/false
   * - Extraction stream ends
   * - Partial results available in event
   * - Client can:
   *   - Resume from lastSuccessfulChunkIndex (if resumable)
   *   - Retry entire extraction from beginning
   *   - Accept partial results
   *
   * LlmRateLimit specifically:
   * - isTemporary = true
   * - retryAfterMs indicates wait duration
   * - Client should wait and retry (exponential backoff recommended)
   */
  readonly systemicErrors: {
    readonly fatal: true
    readonly streamEnds: true
    readonly partialResults: true
    readonly resumable: "some" // Only if lastSuccessfulChunkIndex set
  }

  /**
   * Content Errors (Entity extraction fails for a chunk, but other chunks ok)
   *
   * - Emit RecoverableErrorEvent
   * - Extraction continues with next chunk
   * - This chunk contributes empty results
   * - Client sees stream continue, progress updates after error
   *
   * Examples:
   * - LLM returns unparseable response for one chunk
   * - Grounding verification times out for one chunk
   * - Text preprocessing fails for one chunk
   */
  readonly contentErrors: {
    readonly fatal: false
    readonly streamEnds: false
    readonly partialResults: false
    readonly chunkSkipped: true
    readonly continuesWithNextChunk: true
  }

  /**
   * Backpressure (Client consuming too slowly)
   *
   * - Emit BackpressureWarningEvent
   * - If client doesn't speed up:
   *   - Based on config.strategy: drop_oldest | drop_newest | block_producer | close_stream
   *   - Event loss may occur
   * - Client should increase parallelism or event consumption rate
   * - Extraction continues server-side regardless
   */
  readonly backpressure: {
    readonly fatal: false
    readonly streamEnds: "maybe" // If strategy is "close_stream"
    readonly eventLossPossible: true
    readonly clientShouldAction: true
  }

  /**
   * Client Cancellation
   *
   * - Client sends CancellationRequest
   * - Server emits ExtractionCancelledEvent
   * - Extraction stream ends gracefully
   * - Partial results available
   * - Server cleans up resources
   */
  readonly clientCancellation: {
    readonly fatal: false
    readonly streamEnds: true
    readonly graceful: true
    readonly partialResults: true
  }
}

/**
 * Documented error recovery semantics
 */
export const ErrorRecoverySemanticsSpec: ErrorRecoverySemantics = {
  systemicErrors: {
    fatal: true,
    streamEnds: true,
    partialResults: true,
    resumable: "some"
  },
  contentErrors: {
    fatal: false,
    streamEnds: false,
    partialResults: false,
    chunkSkipped: true,
    continuesWithNextChunk: true
  },
  backpressure: {
    fatal: false,
    streamEnds: "maybe",
    eventLossPossible: true,
    clientShouldAction: true
  },
  clientCancellation: {
    fatal: false,
    streamEnds: true,
    graceful: true,
    partialResults: true
  }
}

// =============================================================================
// RPC Message Contract (JSON-serializable wrapper)
// =============================================================================

/**
 * Progress Message - RPC-safe wrapper for ProgressEvent
 *
 * Used for serialization over WebSocket/RPC. Encodes event as JSON
 * with error information if event is not serializable.
 */
export class ProgressMessage extends Schema.Class<ProgressMessage>("ProgressMessage")({
  /**
   * Message type discriminator
   */
  type: Schema.Literal("progress"),

  /**
   * The actual progress event (or error if event not serializable)
   */
  data: Schema.Union(
    ProgressEventSchema,
    Schema.Struct({
      _tag: Schema.Literal("serialization_error"),
      eventTag: Schema.String,
      originalError: Schema.String
    })
  ),

  /**
   * When was this message created?
   */
  createdAt: Timestamp
}) {}

// =============================================================================
// WebSocket Contract Layer (Protocol)
// =============================================================================

/**
 * WebSocket Protocol Contract
 *
 * Defines the message flow between client and server.
 *
 * CLIENT → SERVER:
 * 1. StartExtractionRequest: { runId?, text, config }
 * 2. CancellationRequest: { runId, reason? }
 * 3. AckMessage: { eventId } - Acknowledge receipt for backpressure tracking
 *
 * SERVER → CLIENT:
 * 1. StartExtractionResponse: { runId, accepted, error? }
 * 2. ProgressMessage: { data: ProgressEvent, createdAt }
 * 3. CancellationResponse: { runId, accepted, reason? }
 * 4. BackpressureWarningEvent: (special case - client must respond with Ack)
 *
 * Flow:
 * ```
 * CLIENT: StartExtractionRequest
 *    ↓
 * SERVER: StartExtractionResponse { runId, accepted: true }
 *    ↓
 * SERVER: ExtractionStartedEvent
 *    ↓
 * SERVER: [ChunkingStartedEvent, ChunkingProgressEvent*, ChunkingCompleteEvent]
 *    ↓
 * SERVER: [ChunkProcessingStartedEvent, {phase events}*, ChunkProcessingCompleteEvent]*
 *    ↓
 * SERVER: ExtractionCompleteEvent | ExtractionFailedEvent | ExtractionCancelledEvent
 *    ↓
 * [Connection ends or client starts new extraction]
 * ```
 */

/**
 * Start Extraction Request
 *
 * Client initiates an extraction
 */
export class StartExtractionRequest extends Schema.Class<StartExtractionRequest>(
  "StartExtractionRequest"
)({
  /**
   * Request type
   */
  type: Schema.Literal("start_extraction"),

  /**
   * Text to extract from
   */
  text: Schema.String.pipe(
    Schema.minLength(1),
    Schema.annotations({
      title: "Text",
      description: "Source text for extraction"
    })
  ),

  /**
   * Extraction configuration
   */
  config: Schema.Struct({
    chunking: Schema.Struct({
      maxChunkSize: Schema.Number.pipe(Schema.int(), Schema.positive()),
      preserveSentences: Schema.Boolean
    }),
    concurrency: Schema.Number.pipe(Schema.int(), Schema.positive()),
    ontologyPath: Schema.String
  }),

  /**
   * Optional run ID override (for resuming extractions)
   */
  runId: Schema.optional(ExtractionRunId)
}) {}

/**
 * Start Extraction Response
 *
 * Server confirms extraction request
 */
export class StartExtractionResponse extends Schema.Class<StartExtractionResponse>(
  "StartExtractionResponse"
)({
  /**
   * Response type
   */
  type: Schema.Literal("start_extraction_response"),

  /**
   * Generated/provided run ID
   */
  runId: ExtractionRunId,

  /**
   * Was extraction accepted?
   */
  accepted: Schema.Boolean,

  /**
   * Error if not accepted
   */
  error: Schema.optional(
    Schema.Struct({
      code: Schema.String,
      message: Schema.String
    })
  ),

  /**
   * Response timestamp
   */
  timestamp: Timestamp
}) {}

/**
 * Acknowledgment Message
 *
 * Client acknowledges receipt of events (for backpressure tracking)
 */
export class AckMessage extends Schema.Class<AckMessage>("AckMessage")({
  /**
   * Message type
   */
  type: Schema.Literal("ack"),

  /**
   * Run ID of extraction
   */
  runId: ExtractionRunId,

  /**
   * Event ID being acknowledged
   */
  eventId: Schema.String,

  /**
   * Timestamp
   */
  timestamp: Timestamp
}) {}
