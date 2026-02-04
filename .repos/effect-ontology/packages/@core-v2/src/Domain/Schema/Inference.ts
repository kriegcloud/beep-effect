/**
 * Schema: Inference API payloads
 *
 * Request/response schemas for the RDFS inference API endpoints.
 * Enables standalone reasoning on RDF graphs with delta computation.
 *
 * @since 2.0.0
 */

import { Schema } from "effect"

// =============================================================================
// Reasoning Profile
// =============================================================================

/**
 * Available reasoning profiles for inference
 *
 * @since 2.0.0
 * @category Schema
 */
export const ReasoningProfile = Schema.Literal(
  "rdfs", // Full RDFS entailment
  "rdfs-subclass", // Only subclass inference
  "owl-sameas", // OWL sameAs transitive closure
  "custom" // Custom N3 rules
)
export type ReasoningProfile = typeof ReasoningProfile.Type

// =============================================================================
// Inference Statistics
// =============================================================================

/**
 * Statistics from an inference run
 *
 * @since 2.0.0
 * @category Schema
 */
export const InferenceStats = Schema.Struct({
  /** Number of triples in original graph */
  originalTriples: Schema.Number,
  /** Number of triples after reasoning */
  enrichedTriples: Schema.Number,
  /** Number of new triples inferred */
  inferredTriples: Schema.Number,
  /** Ratio of inferred to original triples */
  inferenceRatio: Schema.Number,
  /** Breakdown of inferred triples by predicate type */
  predicateBreakdown: Schema.Record({ key: Schema.String, value: Schema.Number }),
  /** Duration of reasoning in milliseconds */
  durationMs: Schema.Number
})
export type InferenceStats = typeof InferenceStats.Type

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Request to run inference on an RDF graph
 *
 * @since 2.0.0
 * @category Schema
 */
export class InferenceRunRequest extends Schema.Class<InferenceRunRequest>("InferenceRunRequest")({
  /** Input graph as Turtle or TriG serialization */
  inputGraph: Schema.String.pipe(Schema.minLength(1)),

  /** Input format: turtle (default) or trig */
  format: Schema.optionalWith(Schema.Literal("turtle", "trig"), { default: () => "turtle" as const }),

  /** Reasoning profile to apply */
  profile: Schema.optionalWith(ReasoningProfile, { default: () => "rdfs" as const }),

  /** Custom N3 rules (when profile is "custom") */
  customRules: Schema.optional(Schema.Array(Schema.String)),

  /** Return only delta (new triples) or full enriched graph */
  returnDeltaOnly: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Status of an inference job
 *
 * @since 2.0.0
 * @category Schema
 */
export const InferenceStatus = Schema.Literal("complete", "processing", "failed")
export type InferenceStatus = typeof InferenceStatus.Type

/**
 * Response from inference run
 *
 * @since 2.0.0
 * @category Schema
 */
export class InferenceRunResponse extends Schema.Class<InferenceRunResponse>("InferenceRunResponse")({
  /** Unique job identifier */
  jobId: Schema.String,

  /** Job status */
  status: InferenceStatus,

  /** Output graph (delta or full based on request) */
  outputGraph: Schema.optional(Schema.String),

  /** Inference statistics */
  stats: Schema.optional(InferenceStats),

  /** Error message if failed */
  error: Schema.optional(Schema.String)
}) {}

/**
 * Response for polling inference job status
 *
 * @since 2.0.0
 * @category Schema
 */
export class InferenceStatusResponse extends Schema.Class<InferenceStatusResponse>("InferenceStatusResponse")({
  /** Job identifier */
  jobId: Schema.String,

  /** Current status */
  status: InferenceStatus,

  /** Full result when complete */
  result: Schema.optional(InferenceRunResponse)
}) {}
