/**
 * @file Docgen CLI Error Classes
 *
 * Defines all tagged error types used throughout the docgen CLI commands.
 * Uses Effect Schema TaggedError for type-safe error handling.
 *
 * Key exports:
 * - PackageNotFoundError: Package directory or package.json missing
 * - DocgenConfigError: Issues with docgen.json configuration
 * - TsMorphError: TypeScript AST parsing errors
 * - DocgenProcessError: Child process execution failures
 * - TsConfigNotFoundError: Unable to locate tsconfig file
 * - InvalidPackagePathError: Invalid or non-existent package path
 * - AggregationError: Docs aggregation failures
 *
 * @module docgen/errors
 * @since 0.1.0
 * @see DOCGEN_CLI_IMPLEMENTATION.md#error-handling
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

/**
 * Helper to create errors with cause chains.
 *
 * @example
 * ```ts
 * import { withCause, PackageNotFoundError } from "@beep/repo-cli/commands/docgen/errors"
 *
 * const error = withCause(
 *   new PackageNotFoundError({ path: "/foo/bar" }),
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

/**
 * Error indicating a package directory or package.json was not found.
 *
 * @example
 * ```ts
 * import { PackageNotFoundError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const checkPackage = (path: string) =>
 *   Effect.fail(new PackageNotFoundError({ path, message: "Directory does not exist" }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property path - The path that was searched
 * @property message - Optional additional context
 */
export class PackageNotFoundError extends S.TaggedError<PackageNotFoundError>()("PackageNotFoundError", {
  path: S.String,
  message: S.optional(S.String),
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Package not found: ${this.path}${this.message !== undefined ? ` (${this.message})` : ""}`;
  }
}

/**
 * Error indicating issues with docgen.json configuration.
 *
 * @example
 * ```ts
 * import { DocgenConfigError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const validateConfig = (path: string) =>
 *   Effect.fail(new DocgenConfigError({ path, reason: "Invalid JSON syntax" }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property path - Path to the docgen.json file
 * @property reason - Description of what went wrong
 */
export class DocgenConfigError extends S.TaggedError<DocgenConfigError>()("DocgenConfigError", {
  path: S.String,
  reason: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Config error at ${this.path}: ${this.reason}`;
  }
}

/**
 * Error wrapping ts-morph AST parsing failures.
 *
 * @example
 * ```ts
 * import { TsMorphError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const parseFile = (filePath: string, error: unknown) =>
 *   Effect.fail(new TsMorphError({ filePath, cause: error }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property filePath - Path to the TypeScript file being parsed
 * @property cause - The underlying error from ts-morph
 */
export class TsMorphError extends S.TaggedError<TsMorphError>()("TsMorphError", {
  filePath: S.String,
  cause: S.Unknown,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `AST parsing failed for ${this.filePath}: ${String(this.cause)}`;
  }
}

/**
 * Error indicating @effect/docgen process execution failed.
 *
 * @example
 * ```ts
 * import { DocgenProcessError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const handleFailure = (packageName: string, stderr: string, exitCode: number) =>
 *   Effect.fail(new DocgenProcessError({ packageName, stderr, exitCode }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property packageName - Name of the package being processed
 * @property stderr - Standard error output from the process
 * @property exitCode - Optional exit code if available
 */
export class DocgenProcessError extends S.TaggedError<DocgenProcessError>()("DocgenProcessError", {
  packageName: S.String,
  stderr: S.String,
  exitCode: S.optional(S.Number),
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    const exitInfo = this.exitCode !== undefined ? ` (exit code: ${this.exitCode})` : "";
    return `Docgen failed for ${this.packageName}${exitInfo}: ${this.stderr}`;
  }
}

/**
 * Error indicating no suitable tsconfig file was found.
 *
 * @example
 * ```ts
 * import { TsConfigNotFoundError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 *
 * const searched = ["tsconfig.json", "tsconfig.build.json"]
 * const error = Effect.fail(
 *   new TsConfigNotFoundError({ packagePath: "/packages/foo", searchedFiles: searched })
 * )
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property packagePath - The package directory that was searched
 * @property searchedFiles - List of filenames that were checked
 */
export class TsConfigNotFoundError extends S.TaggedError<TsConfigNotFoundError>()("TsConfigNotFoundError", {
  packagePath: S.String,
  searchedFiles: S.Array(S.String),
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `No tsconfig found in ${this.packagePath}. Searched: ${this.searchedFiles.join(", ")}`;
  }
}

/**
 * Error indicating the provided package path is invalid.
 *
 * @example
 * ```ts
 * import { InvalidPackagePathError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const validatePath = (path: string) =>
 *   Effect.fail(new InvalidPackagePathError({ path, reason: "Not a directory" }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property path - The invalid path that was provided
 * @property reason - Explanation of why the path is invalid
 */
export class InvalidPackagePathError extends S.TaggedError<InvalidPackagePathError>()("InvalidPackagePathError", {
  path: S.String,
  reason: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Invalid package path ${this.path}: ${this.reason}`;
  }
}

/**
 * Error indicating docs aggregation failed for a package.
 *
 * @example
 * ```ts
 * import { AggregationError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const failAggregation = (packageName: string) =>
 *   Effect.fail(new AggregationError({ packageName, reason: "Missing docs directory" }))
 * ```
 *
 * @since 0.1.0
 * @category errors
 * @property packageName - Name of the package being aggregated
 * @property reason - Description of what went wrong
 */
export class AggregationError extends S.TaggedError<AggregationError>()("AggregationError", {
  packageName: S.String,
  reason: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Aggregation failed for ${this.packageName}: ${this.reason}`;
  }
}

/**
 * Union of all docgen errors for Effect error channel typing.
 *
 * @example
 * ```ts
 * import type { DocgenError } from "@beep/repo-cli/commands/docgen/errors"
 * import * as Effect from "effect/Effect"
 *
 * const processPackage: Effect.Effect<void, DocgenError, never> =
 *   Effect.succeed(void 0)
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type DocgenError =
  | PackageNotFoundError
  | DocgenConfigError
  | TsMorphError
  | DocgenProcessError
  | TsConfigNotFoundError
  | InvalidPackagePathError
  | AggregationError;
