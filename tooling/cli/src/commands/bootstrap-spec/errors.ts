/**
 * @file Bootstrap-Spec CLI Error Classes
 *
 * Defines all tagged error types used throughout the bootstrap-spec CLI command.
 * Uses Effect Schema TaggedError for type-safe error handling with identity-based
 * error tags following the beep-effect identity system.
 *
 * Key exports:
 * - SpecExistsError: Spec directory already exists
 * - InvalidSpecNameError: Spec name validation failed
 * - FileWriteError: Failed to write generated file
 *
 * @module bootstrap-spec/errors
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

/**
 * Identity composer for bootstrap-spec command errors.
 * Creates unique, traceable error identifiers.
 */
const $I = $RepoCliId.create("commands/bootstrap-spec");

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
 * Error indicating a spec directory already exists at the target path.
 *
 * @example
 * ```ts
 * import { SpecExistsError } from "@beep/repo-cli/commands/bootstrap-spec/errors"
 * import * as Effect from "effect/Effect"
 *
 * const checkSpec = (name: string) =>
 *   Effect.fail(new SpecExistsError({ specName: name, path: `specs/${name}` }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property specName - The name of the spec that already exists
 * @property path - The path where the spec already exists
 */
export class SpecExistsError extends S.TaggedError<SpecExistsError>()($I`SpecExistsError`, {
  specName: S.String,
  path: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Spec "${this.specName}" already exists at ${this.path}`;
  }
}

/**
 * Error indicating the provided spec name is invalid.
 *
 * @example
 * ```ts
 * import { InvalidSpecNameError } from "@beep/repo-cli/commands/bootstrap-spec/errors"
 * import * as Effect from "effect/Effect"
 *
 * const validateName = (name: string) =>
 *   Effect.fail(new InvalidSpecNameError({
 *     specName: name,
 *     reason: "Must start with a lowercase letter"
 *   }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property specName - The invalid spec name that was provided
 * @property reason - Explanation of why the name is invalid
 */
export class InvalidSpecNameError extends S.TaggedError<InvalidSpecNameError>()($I`InvalidSpecNameError`, {
  specName: S.String,
  reason: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Invalid spec name "${this.specName}": ${this.reason}`;
  }
}

/**
 * Error indicating a file write operation failed during spec generation.
 *
 * @example
 * ```ts
 * import { FileWriteError } from "@beep/repo-cli/commands/bootstrap-spec/errors"
 * import * as Effect from "effect/Effect"
 *
 * const writeFile = (path: string) =>
 *   Effect.fail(new FileWriteError({
 *     filePath: path,
 *     cause: new Error("ENOENT")
 *   }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property filePath - Path to the file that failed to write
 * @property cause - The underlying error from the file system operation
 */
export class FileWriteError extends S.TaggedError<FileWriteError>()($I`FileWriteError`, {
  filePath: S.String,
  cause: S.Unknown,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Failed to write file: ${this.filePath}`;
  }
}

// -----------------------------------------------------------------------------
// Error Union Type
// -----------------------------------------------------------------------------

/**
 * Union of all bootstrap-spec errors for Effect error channel typing.
 *
 * @example
 * ```ts
 * import type { BootstrapSpecError } from "@beep/repo-cli/commands/bootstrap-spec/errors"
 * import * as Effect from "effect/Effect"
 *
 * const generateSpec: Effect.Effect<void, BootstrapSpecError, never> =
 *   Effect.succeed(void 0)
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type BootstrapSpecError = SpecExistsError | InvalidSpecNameError | FileWriteError;
