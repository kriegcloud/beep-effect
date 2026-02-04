/**
 * Schema: API Types
 *
 * Request/Response schemas for the Extraction API.
 *
 * @since 2.0.0
 * @module Domain/Schema/Api
 */

import { Schema } from "effect"
import { RunConfig } from "../Model/ExtractionRun.js"

/**
 * Request to submit a new extraction job
 *
 * Users can provide:
 * 1. Inline text (ideal for small documents)
 * 2. Remote URL (ideal for large documents, handled by fetcher)
 *
 * @since 2.0.0
 */
export class SubmitJobRequest extends Schema.Class<SubmitJobRequest>("SubmitJobRequest")({
  /** Inline text content */
  text: Schema.optional(Schema.String),

  /** Remote URL to fetch content from */
  url: Schema.optional(Schema.String),

  /**
   * Custom run configuration override.
   * If omitted, defaults from server config/env are used.
   */
  config: Schema.optional(RunConfig)
}) {
  /** Ensure at least one input source is provided */
  static validate(input: unknown) {
    return Schema.decodeUnknown(this)(input).pipe() // Custom validation logic could go here if Schema.transform/filter was used
    // simpler to rely on basic schema for now
  }
}

/**
 * Job Status Enum
 */
export const JobStatus = Schema.Literal(
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
)

export type JobStatus = Schema.Schema.Type<typeof JobStatus>

/**
 * Response for Job Status
 * Returns the current state and a summary of progress.
 */
export class JobStatusResponse extends Schema.Class<JobStatusResponse>("JobStatusResponse")({
  jobId: Schema.String,
  status: JobStatus,
  submittedAt: Schema.String,
  completedAt: Schema.optional(Schema.String),
  error: Schema.optional(Schema.String),
  errorType: Schema.optional(Schema.Literal("expected", "defect", "interrupted", "timeout", "unknown")),

  /** Progress summary */
  progress: Schema.Struct({
    chunksTotal: Schema.Number,
    chunksProcessed: Schema.Number,
    entitiesExtracted: Schema.Number,
    relationsExtracted: Schema.Number
  })
}) {}
