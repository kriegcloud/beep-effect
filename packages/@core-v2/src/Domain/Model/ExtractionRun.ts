/**
 * Domain Model: Extraction Run
 *
 * Represents an execution of the knowledge extraction pipeline.
 * Tracks configuration, status, and statistics.
 *
 * @since 2.0.0
 * @module Domain/Model/ExtractionRun
 */

import { Data, PrimaryKey, Schema } from "effect"
import { DocumentId } from "../Identity.js"
import { PathLayout } from "../PathLayout.js"
import type { OutputType } from "../PathLayout.js"
import { OntologyRef } from "./Ontology.js"

// =============================================================================
// Enums & Types
// =============================================================================

/**
 * Output file metadata
 */
export class OutputMetadata extends Schema.Class<OutputMetadata>("OutputMetadata")({
  type: Schema.String,
  path: Schema.String,
  hash: Schema.String,
  size: Schema.Number,
  savedAt: Schema.String
}) {}

export type AuditEventType = "started" | "completed" | "failed" | "info" | "warning"

/**
 * Audit Event
 */
export class AuditEvent extends Schema.Class<AuditEvent>("AuditEvent")({
  timestamp: Schema.String,
  type: Schema.String,
  data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
}) {}

export type AuditErrorType = ErrorCode

/**
 * Audit Error
 */
export class AuditError extends Schema.Class<AuditError>("AuditError")({
  timestamp: Schema.String,
  type: Schema.String,
  message: Schema.String,
  context: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
}) {}

/**
 * Run termination error codes
 */
export const ErrorCode = Schema.Literal(
  "validation",
  "llm_error",
  "storage",
  "timeout",
  "rate_limited",
  "cancelled",
  "unknown"
)
export type ErrorCode = typeof ErrorCode.Type

/**
 * Run status as TaggedEnum for pattern matching
 */
export type RunStatus = Data.TaggedEnum<{
  Pending: object
  Running: { startedAt: Date }
  Complete: { completedAt: Date }
  Failed: { failedAt: Date; errorCode: ErrorCode }
}>
export const RunStatus = Data.taggedEnum<RunStatus>()

// =============================================================================
// Helpers
// =============================================================================

export const getChunkId = (runId: string, index: number): string => `${runId}-chunk-${index}`

// =============================================================================
// Domain Classes
// =============================================================================

/**
 * Configuration for document chunking
 */
export class ChunkingConfig extends Schema.Class<ChunkingConfig>("ChunkingConfig")({
  maxChunkSize: Schema.Int.pipe(Schema.positive(), Schema.between(100, 10000)),
  preserveSentences: Schema.optionalWith(Schema.Boolean, { default: () => true }),
  overlapTokens: Schema.optionalWith(Schema.Int.pipe(Schema.between(0, 200)), { default: () => 50 })
}) {}

/**
 * Configuration for LLM execution within a run
 */
export class LlmConfig extends Schema.Class<LlmConfig>("LlmConfig")({
  model: Schema.NonEmptyString,
  temperature: Schema.Number.pipe(Schema.between(0, 2)),
  maxTokens: Schema.Int.pipe(Schema.positive()),
  timeoutMs: Schema.Int.pipe(Schema.between(1000, 300000))
}) {}

/**
 * Complete configuration for an extraction run
 */
export class RunConfig extends Schema.Class<RunConfig>("RunConfig")({
  ontology: OntologyRef,
  chunking: ChunkingConfig,
  llm: LlmConfig,
  concurrency: Schema.optionalWith(Schema.Int.pipe(Schema.between(1, 32)), { default: () => 4 }),
  enableGrounding: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

/**
 * Statistics collected during a run
 */
export class RunStats extends Schema.Class<RunStats>("RunStats")({
  chunkCount: Schema.Int.pipe(Schema.nonNegative()),
  entityCount: Schema.Int.pipe(Schema.nonNegative()),
  relationCount: Schema.Int.pipe(Schema.nonNegative()),
  resolvedCount: Schema.Int.pipe(Schema.nonNegative()),
  clusterCount: Schema.Int.pipe(Schema.nonNegative()),
  tokensUsed: Schema.Int.pipe(Schema.nonNegative()),
  durationMs: Schema.Int.pipe(Schema.nonNegative())
}) {}

/**
 * Extraction Run Record
 *
 * Root aggregate for a single execution of the pipeline.
 * Persisted to storage as `metadata.json`.
 */
export class ExtractionRun extends Schema.Class<ExtractionRun>("ExtractionRun")({
  /**
   * Unique ID derived from document content
   */
  id: DocumentId,

  /**
   * Idempotency key covering content + config + ontology
   */
  idempotencyKey: Schema.optional(Schema.String), // Changed from IdempotencyKey to allow string or optional better

  /**
   * Current execution status
   */
  status: Schema.Literal("pending", "running", "complete", "failed"),

  /**
   * Run configuration snapshot
   */
  config: RunConfig,

  /**
   * Ontology Version used
   */
  ontologyVersion: Schema.optional(Schema.String),

  /**
   * Timestamps
   */
  createdAt: Schema.String, // Changed to String for easy JSON serialization
  updatedAt: Schema.optional(Schema.String),
  completedAt: Schema.optional(Schema.String),

  /**
   * Output directory path
   */
  outputDir: Schema.String,

  /**
   * Run results/stats (optional until complete)
   */
  stats: Schema.optional(RunStats),

  /**
   * Outputs generated by the run
   */
  outputs: Schema.Array(OutputMetadata),

  /**
   * Audit events
   */
  events: Schema.Array(AuditEvent),

  /**
   * Errors encountered
   */
  errors: Schema.Array(AuditError),

  /**
   * Error details if failed (Summary)
   */
  error: Schema.optional(Schema.Struct({
    code: ErrorCode,
    message: Schema.String
  }))
}) {
  /**
   * Effect PrimaryKey
   */
  [PrimaryKey.symbol]() {
    return this.id
  }

  // Derived paths

  get metadataPath(): string {
    return PathLayout.run.metadata(this.id)
  }

  get inputPath(): string {
    return PathLayout.run.input(this.id)
  }

  outputPath(type: OutputType): string {
    return PathLayout.run.output(this.id, type)
  }
}
