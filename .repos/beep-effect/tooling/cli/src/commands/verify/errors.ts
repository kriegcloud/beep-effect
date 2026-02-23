/**
 * @file Verify Command Error Classes
 *
 * Defines all tagged error types used throughout the verify CLI command.
 * Uses Effect Schema TaggedError for type-safe error handling with identity-based
 * error tags following the beep-effect identity system.
 *
 * @module verify/errors
 * @since 0.1.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

/**
 * Identity composer for verify command errors.
 * Creates unique, traceable error identifiers.
 */
const $I = $RepoCliId.create("commands/verify");

// -----------------------------------------------------------------------------
// Cause Chain Support
// -----------------------------------------------------------------------------

/**
 * Base schema fields for cause chain support.
 * Include in all TaggedError definitions.
 */
const CauseFields = {
  /** Original error that caused this one */
  underlyingCause: S.optional(S.Unknown),
  /** Stack trace at point of error creation */
  stack: S.optional(S.String),
  /** Operation that was being performed */
  operation: S.optional(S.String),
};

// -----------------------------------------------------------------------------
// Tagged Errors
// -----------------------------------------------------------------------------

/**
 * Error indicating violations were found during verification.
 *
 * Used in CI mode to signal a non-zero exit code.
 *
 * @example
 * ```ts
 * import { ViolationsFoundError } from "@beep/repo-cli/commands/verify/errors"
 * import * as Effect from "effect/Effect"
 *
 * const checkViolations = (count: number) =>
 *   count > 0
 *     ? Effect.fail(new ViolationsFoundError({ count }))
 *     : Effect.void
 * ```
 *
 * @since 0.1.0
 * @category errors
 */
export class ViolationsFoundError extends S.TaggedError<ViolationsFoundError>()($I`ViolationsFoundError`, {
  /** Number of violations found */
  count: S.Number,
  /** Number of critical violations */
  critical: S.optionalWith(S.Number, { default: () => 0 }),
  /** Number of warning violations */
  warning: S.optionalWith(S.Number, { default: () => 0 }),
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Found ${this.count} violation(s): ${this.critical} critical, ${this.warning} warning`;
  }
}

/**
 * Error indicating file read failure during scanning.
 *
 * @example
 * ```ts
 * import { FileScanError } from "@beep/repo-cli/commands/verify/errors"
 * import * as Effect from "effect/Effect"
 *
 * const scanFile = (path: string) =>
 *   Effect.fail(new FileScanError({ filePath: path, cause: new Error("ENOENT") }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 */
export class FileScanError extends S.TaggedError<FileScanError>()($I`FileScanError`, {
  /** Path to the file that failed to scan */
  filePath: S.String,
  /** The underlying error */
  cause: S.Unknown,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Failed to scan file: ${this.filePath}`;
  }
}

/**
 * Error indicating glob pattern matching failed.
 *
 * @since 0.1.0
 * @category errors
 */
export class GlobError extends S.TaggedError<GlobError>()($I`GlobError`, {
  /** The glob pattern that failed */
  pattern: S.String,
  /** The underlying error */
  cause: S.Unknown,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Failed to match glob pattern: ${this.pattern}`;
  }
}

/**
 * Error indicating invalid filter pattern.
 *
 * @since 0.1.0
 * @category errors
 */
export class InvalidFilterError extends S.TaggedError<InvalidFilterError>()($I`InvalidFilterError`, {
  /** The invalid filter value */
  filter: S.String,
  /** Reason why the filter is invalid */
  reason: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Invalid filter "${this.filter}": ${this.reason}`;
  }
}

// -----------------------------------------------------------------------------
// Error Union Type
// -----------------------------------------------------------------------------

/**
 * Union of all verify command errors for Effect error channel typing.
 *
 * @since 0.1.0
 * @category models
 */
export type VerifyError = ViolationsFoundError | FileScanError | GlobError | InvalidFilterError;
