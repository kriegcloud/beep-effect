/**
 * Domain Model: Batch Workflow (Effect-native)
 *
 * Single tagged-union schema for batch lifecycle states.
 * Keeps state minimal and uses branded IDs/URIs to avoid stringly code.
 *
 * @since 2.0.0
 */

import { Match, Schema } from "effect"
import { BatchId, DocumentId, GcsUri, OntologyVersion } from "../Identity.js"

// -----------------------------------------------------------------------------
// Per-Document Status Tracking
// -----------------------------------------------------------------------------

/**
 * Status of a single document within a batch
 */
export const DocumentStatus = Schema.Struct({
  documentId: DocumentId,
  status: Schema.Literal("pending", "processing", "success", "failed"),
  graphUri: Schema.optional(GcsUri),
  entityCount: Schema.optional(Schema.Number),
  relationCount: Schema.optional(Schema.Number),
  claimCount: Schema.optional(Schema.Number),
  error: Schema.optional(Schema.Struct({
    code: Schema.String,
    message: Schema.String
  })),
  startedAt: Schema.optional(Schema.DateTimeUtc),
  completedAt: Schema.optional(Schema.DateTimeUtc)
})

export type DocumentStatus = typeof DocumentStatus.Type

/**
 * Common fields shared by all states.
 */
const BatchBase = {
  batchId: BatchId,
  /** Ontology ID for event routing and scoping */
  ontologyId: Schema.String,
  manifestUri: GcsUri,
  ontologyVersion: OntologyVersion,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
}

export const BatchPending = Schema.TaggedStruct("Pending", {
  ...BatchBase,
  documentCount: Schema.Number
})

export const BatchPreprocessing = Schema.TaggedStruct("Preprocessing", {
  ...BatchBase,
  documentsTotal: Schema.Number,
  documentsClassified: Schema.Number,
  documentsFailed: Schema.Number,
  /** URI of the enriched manifest once preprocessing completes */
  enrichedManifestUri: Schema.optional(GcsUri)
})

export const BatchExtracting = Schema.TaggedStruct("Extracting", {
  ...BatchBase,
  documentsTotal: Schema.Number,
  documentsCompleted: Schema.Number,
  documentsFailed: Schema.Number,
  currentDocumentId: Schema.optional(DocumentId),
  /** Per-document status for visibility into partial failures */
  documentStatuses: Schema.optional(Schema.Array(DocumentStatus))
})

export const BatchResolving = Schema.TaggedStruct("Resolving", {
  ...BatchBase,
  extractionOutputUri: GcsUri,
  entitiesTotal: Schema.Number,
  clustersFormed: Schema.Number
})

export const BatchValidating = Schema.TaggedStruct("Validating", {
  ...BatchBase,
  resolvedGraphUri: GcsUri,
  validationStartedAt: Schema.DateTimeUtc
})

export const BatchIngesting = Schema.TaggedStruct("Ingesting", {
  ...BatchBase,
  validatedGraphUri: GcsUri,
  triplesTotal: Schema.Number,
  triplesIngested: Schema.Number
})

export const BatchComplete = Schema.TaggedStruct("Complete", {
  ...BatchBase,
  canonicalGraphUri: GcsUri,
  stats: Schema.Struct({
    documentsProcessed: Schema.Number,
    documentsSucceeded: Schema.optional(Schema.Number),
    documentsFailed: Schema.optional(Schema.Number),
    entitiesExtracted: Schema.Number,
    relationsExtracted: Schema.Number,
    claimsExtracted: Schema.Number,
    clustersResolved: Schema.Number,
    triplesIngested: Schema.Number,
    totalDurationMs: Schema.Number
  }),
  /** Per-document status for visibility into partial failures */
  documentStatuses: Schema.optional(Schema.Array(DocumentStatus)),
  completedAt: Schema.DateTimeUtc
})

export const BatchFailed = Schema.TaggedStruct("Failed", {
  ...BatchBase,
  failedAt: Schema.DateTimeUtc,
  failedInStage: Schema.Literal("pending", "preprocessing", "extracting", "resolving", "validating", "ingesting"),
  error: Schema.Struct({
    code: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }),
  lastSuccessfulStage: Schema.optional(
    Schema.Literal("pending", "preprocessing", "extracting", "resolving", "validating", "ingesting")
  ),
  /** Per-document status for visibility into which documents succeeded/failed */
  documentStatuses: Schema.optional(Schema.Array(DocumentStatus))
})

export const BatchState = Schema.Union(
  BatchPending,
  BatchPreprocessing,
  BatchExtracting,
  BatchResolving,
  BatchValidating,
  BatchIngesting,
  BatchComplete,
  BatchFailed
)

export type BatchState = typeof BatchState.Type
export type BatchStage = BatchState["_tag"]

// -----------------------------------------------------------------------------
// Helpers for exhaustive handling and progress reporting
// -----------------------------------------------------------------------------

/**
 * Human-readable stage label (exhaustive)
 */
export const stageDisplayName = Match.type<BatchState>().pipe(
  Match.tag("Pending", () => "Pending"),
  Match.tag("Preprocessing", () => "Preprocessing"),
  Match.tag("Extracting", () => "Extracting"),
  Match.tag("Resolving", () => "Resolving"),
  Match.tag("Validating", () => "Validating"),
  Match.tag("Ingesting", () => "Ingesting"),
  Match.tag("Complete", () => "Complete"),
  Match.tag("Failed", () => "Failed")
)

/**
 * Terminal state check (exhaustive)
 */
export const isTerminal = Match.type<BatchState>().pipe(
  Match.tag("Complete", "Failed", () => true),
  Match.tag("Pending", "Preprocessing", "Extracting", "Resolving", "Validating", "Ingesting", () => false)
)

/**
 * Rough progress indicator (0-100, -1 on failure)
 *
 * Pipeline stages and progress allocation:
 * - Pending: 0%
 * - Preprocessing: 0-10% (based on classification progress)
 * - Extracting: 10-35% (based on document completion)
 * - Resolving: 40-50%
 * - Validating: 55-70%
 * - Ingesting: 75-100% (based on triples ingested)
 * - Complete: 100%
 * - Failed: -1
 */
export const progressPercent = Match.type<BatchState>().pipe(
  Match.tag("Pending", () => 0),
  Match.tag(
    "Preprocessing",
    (s) => s.documentsTotal > 0 ? Math.round((s.documentsClassified / s.documentsTotal) * 10) : 0
  ),
  Match.tag(
    "Extracting",
    (s) => s.documentsTotal > 0 ? 10 + Math.round((s.documentsCompleted / s.documentsTotal) * 25) : 10
  ),
  Match.tag("Resolving", () => 45),
  Match.tag("Validating", () => 65),
  Match.tag("Ingesting", (s) => s.triplesTotal > 0 ? 75 + Math.round((s.triplesIngested / s.triplesTotal) * 25) : 85),
  Match.tag("Complete", () => 100),
  Match.tag("Failed", () => -1)
)

/**
 * Extract error details if present
 */
export const getError = Match.type<BatchState>().pipe(
  Match.tag("Failed", (s) => s.error),
  Match.orElse(() => undefined)
)

// -----------------------------------------------------------------------------
// State Transition Validation
// -----------------------------------------------------------------------------

/**
 * Valid state transitions for batch workflow.
 *
 * Rules:
 * - Pending can go to Preprocessing or Failed
 * - Preprocessing can go to Extracting or Failed
 * - Each stage can progress to the next stage or Failed
 * - Complete and Failed are terminal (no outgoing transitions)
 */
export const VALID_TRANSITIONS: Record<BatchStage, ReadonlyArray<BatchStage>> = {
  Pending: ["Preprocessing", "Failed"],
  Preprocessing: ["Extracting", "Failed"],
  Extracting: ["Resolving", "Failed"],
  Resolving: ["Validating", "Failed"],
  Validating: ["Ingesting", "Failed"],
  Ingesting: ["Complete", "Failed"],
  Complete: [], // Terminal state
  Failed: [] // Terminal state
}

/**
 * Check if a state transition is valid.
 *
 * @param fromTag - Current state tag
 * @param toTag - Target state tag
 * @returns true if transition is valid
 *
 * @example
 * ```typescript
 * isValidTransition("Pending", "Extracting")   // true
 * isValidTransition("Pending", "Validating")   // false
 * isValidTransition("Complete", "Failed")      // false
 * ```
 *
 * @since 2.0.0
 * @category Validation
 */
export const isValidTransition = (fromTag: BatchStage, toTag: BatchStage): boolean => {
  // Allow same-state updates (e.g., Extracting with updated progress)
  if (fromTag === toTag) return true

  const validTargets = VALID_TRANSITIONS[fromTag]
  return validTargets.includes(toTag)
}

/**
 * Validate a state transition and return an error message if invalid.
 *
 * @param fromTag - Current state tag
 * @param toTag - Target state tag
 * @returns undefined if valid, error message if invalid
 *
 * @since 2.0.0
 * @category Validation
 */
export const validateTransition = (
  fromTag: BatchStage,
  toTag: BatchStage
): string | undefined => {
  if (isValidTransition(fromTag, toTag)) {
    return undefined
  }

  const validTargets = VALID_TRANSITIONS[fromTag]
  if (validTargets.length === 0) {
    return `Invalid transition: ${fromTag} is a terminal state and cannot transition to ${toTag}`
  }

  return `Invalid transition: ${fromTag} → ${toTag}. Valid targets: ${validTargets.join(", ")}`
}

/**
 * Check if a state is a valid successor of another state (using full state objects).
 *
 * @param from - Current state
 * @param to - Target state
 * @returns true if transition is valid
 *
 * @since 2.0.0
 * @category Validation
 */
export const isValidStateTransition = (from: BatchState, to: BatchState): boolean =>
  isValidTransition(from._tag, to._tag)

/**
 * Get all valid next states for a given state tag.
 *
 * @param tag - Current state tag
 * @returns Array of valid next state tags
 *
 * @since 2.0.0
 * @category Validation
 */
export const getValidNextStates = (tag: BatchStage): ReadonlyArray<BatchStage> => VALID_TRANSITIONS[tag]

/**
 * Check if a state can fail (transition to Failed).
 *
 * @param tag - Current state tag
 * @returns true if state can transition to Failed
 *
 * @since 2.0.0
 * @category Validation
 */
export const canFail = (tag: BatchStage): boolean => VALID_TRANSITIONS[tag].includes("Failed")
