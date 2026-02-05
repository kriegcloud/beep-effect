/**
 * Self-Healing Hook Types
 *
 * Types and schemas for the self-healing hook system.
 * CRITICAL PRINCIPLE: NEVER auto-fix anything that could change runtime behavior.
 */

import * as Schema from "effect/Schema"

// =============================================================================
// Fix Type Classification
// =============================================================================

/**
 * Fix types determine whether a pattern can be auto-fixed:
 * - "safe": Can be auto-applied without changing runtime behavior
 * - "unsafe": Requires human review, could change runtime behavior
 * - "conditional": Safe in some contexts, unsafe in others
 */
export const FixType = Schema.Literal("safe", "unsafe", "conditional")
export type FixType = Schema.Schema.Type<typeof FixType>

// =============================================================================
// Pattern Definition
// =============================================================================

/**
 * Defines a pattern that the self-healing system can detect and potentially fix
 */
export const HookPattern = Schema.Struct({
  /** Unique identifier for this pattern */
  id: Schema.String,
  /** Human-readable name */
  name: Schema.String,
  /** Regex pattern to match (as string for serialization) */
  pattern: Schema.String,
  /** Classification of fix safety */
  fix_type: FixType,
  /** Description of what this pattern detects */
  description: Schema.String,
  /** Category for grouping (imports, schema, entityid, etc.) */
  category: Schema.String,
  /** File extensions this pattern applies to */
  file_extensions: Schema.Array(Schema.String),
})

export type HookPattern = Schema.Schema.Type<typeof HookPattern>

// =============================================================================
// Fix Result
// =============================================================================

/**
 * Result of applying (or suggesting) a fix
 */
export const FixResult = Schema.Struct({
  /** Whether the fix was applied (false for suggestions) */
  applied: Schema.Boolean,
  /** Original text that was matched */
  original: Schema.String,
  /** Fixed/suggested text */
  fixed: Schema.String,
  /** Human-readable message about the fix */
  message: Schema.String,
  /** Pattern ID that triggered this fix */
  pattern_id: Schema.String,
  /** Line number where the match was found (1-indexed) */
  line_number: Schema.optional(Schema.Number),
})

export type FixResult = Schema.Schema.Type<typeof FixResult>

// =============================================================================
// Detection Result
// =============================================================================

/**
 * Result of detecting patterns in code
 */
export const DetectionResult = Schema.Struct({
  /** File path that was analyzed */
  file_path: Schema.String,
  /** All detected patterns with their fix results */
  detections: Schema.Array(FixResult),
  /** Number of safe fixes that can be auto-applied */
  safe_count: Schema.Number,
  /** Number of suggestions that require human review */
  suggestion_count: Schema.Number,
})

export type DetectionResult = Schema.Schema.Type<typeof DetectionResult>
