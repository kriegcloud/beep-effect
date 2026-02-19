/**
 * Generic domain error for operations that fail for non-file-specific reasons.
 *
 * Use this for JSON parse failures, glob failures, and other operational
 * errors where a more specific error type is not warranted.
 *
 * @since 0.0.0
 * @category errors
 */
import * as Data from "effect/Data"

/**
 * A generic domain-level error with an optional underlying cause.
 *
 * @since 0.0.0
 * @category errors
 */
export class DomainError extends Data.TaggedError("DomainError")<{
  readonly message: string
  readonly cause?: unknown
}> {}
