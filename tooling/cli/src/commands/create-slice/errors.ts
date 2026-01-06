/**
 * @file Create-Slice CLI Error Classes
 *
 * Defines all tagged error types used throughout the create-slice CLI command.
 * Uses Effect Schema TaggedError for type-safe error handling with identity-based
 * error tags following the beep-effect identity system.
 *
 * Key exports:
 * - SliceExistsError: Slice directory already exists
 * - InvalidSliceNameError: Slice name validation failed
 * - FileWriteError: Failed to write generated file
 * - TsMorphError: TypeScript AST manipulation failed
 * - TemplateError: Handlebars template compilation failed
 *
 * @module create-slice/errors
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

/**
 * Identity composer for create-slice command errors.
 * Creates unique, traceable error identifiers.
 */
const $I = $RepoCliId.create("commands/create-slice");

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

/**
 * Helper to create errors with cause chains.
 *
 * @example
 * ```ts
 * import { withCause, FileWriteError } from "@beep/repo-cli/commands/create-slice/errors"
 *
 * const error = withCause(
 *   new FileWriteError({ filePath: "/foo/bar.ts", cause: originalError }),
 *   originalError
 * )
 * ```
 *
 * @since 0.1.0
 * @category utilities
 */
export const withCause = <E extends { underlyingCause?: unknown }>(error: E, cause: unknown): E => ({
  ...error,
  underlyingCause: cause,
  stack: new Error().stack,
});

// -----------------------------------------------------------------------------
// Tagged Errors
// -----------------------------------------------------------------------------

/**
 * Error indicating a slice directory already exists at the target path.
 *
 * @example
 * ```ts
 * import { SliceExistsError } from "@beep/repo-cli/commands/create-slice/errors"
 * import * as Effect from "effect/Effect"
 *
 * const checkSlice = (name: string) =>
 *   Effect.fail(new SliceExistsError({ sliceName: name }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property sliceName - The name of the slice that already exists
 */
export class SliceExistsError extends S.TaggedError<SliceExistsError>()($I`SliceExistsError`, {
  sliceName: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Slice "${this.sliceName}" already exists at packages/${this.sliceName}/`;
  }
}

/**
 * Error indicating the provided slice name is invalid.
 *
 * @example
 * ```ts
 * import { InvalidSliceNameError } from "@beep/repo-cli/commands/create-slice/errors"
 * import * as Effect from "effect/Effect"
 *
 * const validateName = (name: string) =>
 *   Effect.fail(new InvalidSliceNameError({
 *     sliceName: name,
 *     reason: "Must start with a lowercase letter"
 *   }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property sliceName - The invalid slice name that was provided
 * @property reason - Explanation of why the name is invalid
 */
export class InvalidSliceNameError extends S.TaggedError<InvalidSliceNameError>()($I`InvalidSliceNameError`, {
  sliceName: S.String,
  reason: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Invalid slice name "${this.sliceName}": ${this.reason}`;
  }
}

/**
 * Error indicating a file write operation failed during slice generation.
 *
 * @example
 * ```ts
 * import { FileWriteError } from "@beep/repo-cli/commands/create-slice/errors"
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

/**
 * Error wrapping ts-morph AST manipulation failures during code generation.
 *
 * @example
 * ```ts
 * import { TsMorphError } from "@beep/repo-cli/commands/create-slice/errors"
 * import * as Effect from "effect/Effect"
 *
 * const updateTsConfig = (path: string) =>
 *   Effect.fail(new TsMorphError({
 *     filePath: path,
 *     operation: "addPathMapping",
 *     cause: new Error("Invalid JSON")
 *   }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property filePath - Path to the TypeScript file being manipulated
 * @property operation - The ts-morph operation that failed
 * @property cause - The underlying error from ts-morph
 */
export class TsMorphError extends S.TaggedError<TsMorphError>()($I`TsMorphError`, {
  filePath: S.String,
  /** The ts-morph operation that failed (overrides CauseFields.operation) */
  operation: S.String,
  cause: S.Unknown,
  /** Original error that caused this one */
  underlyingCause: S.optional(S.Unknown),
  /** Stack trace at point of error creation */
  stack: S.optional(S.String),
}) {
  /** Format for display */
  get displayMessage(): string {
    return `ts-morph error in ${this.filePath} during ${this.operation}`;
  }
}

/**
 * Error indicating Handlebars template compilation or rendering failed.
 *
 * @example
 * ```ts
 * import { TemplateError } from "@beep/repo-cli/commands/create-slice/errors"
 * import * as Effect from "effect/Effect"
 *
 * const compileTemplate = (name: string) =>
 *   Effect.fail(new TemplateError({
 *     templateName: name,
 *     cause: new Error("Missing helper")
 *   }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property templateName - Name of the template that failed
 * @property cause - The underlying Handlebars error
 */
export class TemplateError extends S.TaggedError<TemplateError>()($I`TemplateError`, {
  templateName: S.String,
  cause: S.Unknown,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Failed to compile template: ${this.templateName}`;
  }
}

// -----------------------------------------------------------------------------
// Error Union Type
// -----------------------------------------------------------------------------

/**
 * Union of all create-slice errors for Effect error channel typing.
 *
 * @example
 * ```ts
 * import type { CreateSliceError } from "@beep/repo-cli/commands/create-slice/errors"
 * import * as Effect from "effect/Effect"
 *
 * const generateSlice: Effect.Effect<void, CreateSliceError, never> =
 *   Effect.succeed(void 0)
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type CreateSliceError = SliceExistsError | InvalidSliceNameError | FileWriteError | TsMorphError | TemplateError;
