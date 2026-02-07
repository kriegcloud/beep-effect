/**
 * @file Common CLI Command Error Classes
 *
 * Defines tagged error types shared across simple CLI commands
 * (env, sync, topo-sort). Uses Effect Schema TaggedError for
 * type-safe error handling.
 *
 * @module commands/errors
 * @since 0.1.0
 */

import * as S from "effect/Schema";

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
// File System Errors
// -----------------------------------------------------------------------------

/**
 * Error when a required file is missing.
 *
 * @example
 * ```ts
 * import { MissingRequiredFileError } from "@beep/repo-cli/commands/errors"
 *
 * const error = new MissingRequiredFileError({
 *   filePath: ".env.example",
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class MissingRequiredFileError extends S.TaggedError<MissingRequiredFileError>()("MissingRequiredFileError", {
  filePath: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Missing required file: ${this.filePath}`;
  }
}

// -----------------------------------------------------------------------------
// Sync Command Errors
// -----------------------------------------------------------------------------

/**
 * Error when types generation command fails.
 *
 * @example
 * ```ts
 * import { TypesGenerationError } from "@beep/repo-cli/commands/errors"
 *
 * const error = new TypesGenerationError({
 *   directory: "apps/server",
 *   exitCode: 1,
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class TypesGenerationError extends S.TaggedError<TypesGenerationError>()("TypesGenerationError", {
  directory: S.String,
  exitCode: S.Number,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Types generation failed in ${this.directory} (exit ${this.exitCode})`;
  }
}

/**
 * Error when the .env file is missing.
 *
 * @example
 * ```ts
 * import { MissingEnvFileError } from "@beep/repo-cli/commands/errors"
 *
 * const error = new MissingEnvFileError({})
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class MissingEnvFileError extends S.TaggedError<MissingEnvFileError>()("MissingEnvFileError", {
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return "Missing .env file. Run `beep env` before syncing.";
  }
}

// -----------------------------------------------------------------------------
// Topo-Sort Command Errors
// -----------------------------------------------------------------------------

/**
 * Error when circular dependencies are detected in the package graph.
 *
 * @example
 * ```ts
 * import { CircularDependencyError } from "@beep/repo-cli/commands/errors"
 *
 * const error = new CircularDependencyError({})
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class CircularDependencyError extends S.TaggedError<CircularDependencyError>()("CircularDependencyError", {
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return "Circular dependency detected in package graph";
  }
}
