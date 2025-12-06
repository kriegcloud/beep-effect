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
 * @see DOCGEN_CLI_IMPLEMENTATION.md#error-handling
 */

import * as S from "effect/Schema";

/**
 * Error indicating a package directory or package.json was not found.
 *
 * @property path - The path that was searched
 * @property message - Optional additional context
 */
export class PackageNotFoundError extends S.TaggedError<PackageNotFoundError>()("PackageNotFoundError", {
  path: S.String,
  message: S.optional(S.String),
}) {}

/**
 * Error indicating issues with docgen.json configuration.
 *
 * @property path - Path to the docgen.json file
 * @property reason - Description of what went wrong
 */
export class DocgenConfigError extends S.TaggedError<DocgenConfigError>()("DocgenConfigError", {
  path: S.String,
  reason: S.String,
}) {}

/**
 * Error wrapping ts-morph AST parsing failures.
 *
 * @property filePath - Path to the TypeScript file being parsed
 * @property cause - The underlying error from ts-morph
 */
export class TsMorphError extends S.TaggedError<TsMorphError>()("TsMorphError", {
  filePath: S.String,
  cause: S.Unknown,
}) {}

/**
 * Error indicating @effect/docgen process execution failed.
 *
 * @property packageName - Name of the package being processed
 * @property stderr - Standard error output from the process
 * @property exitCode - Optional exit code if available
 */
export class DocgenProcessError extends S.TaggedError<DocgenProcessError>()("DocgenProcessError", {
  packageName: S.String,
  stderr: S.String,
  exitCode: S.optional(S.Number),
}) {}

/**
 * Error indicating no suitable tsconfig file was found.
 *
 * @property packagePath - The package directory that was searched
 * @property searchedFiles - List of filenames that were checked
 */
export class TsConfigNotFoundError extends S.TaggedError<TsConfigNotFoundError>()("TsConfigNotFoundError", {
  packagePath: S.String,
  searchedFiles: S.Array(S.String),
}) {}

/**
 * Error indicating the provided package path is invalid.
 *
 * @property path - The invalid path that was provided
 * @property reason - Explanation of why the path is invalid
 */
export class InvalidPackagePathError extends S.TaggedError<InvalidPackagePathError>()("InvalidPackagePathError", {
  path: S.String,
  reason: S.String,
}) {}

/**
 * Error indicating docs aggregation failed for a package.
 *
 * @property packageName - Name of the package being aggregated
 * @property reason - Description of what went wrong
 */
export class AggregationError extends S.TaggedError<AggregationError>()("AggregationError", {
  packageName: S.String,
  reason: S.String,
}) {}

/** Union of all docgen errors for Effect error channel typing */
export type DocgenError =
  | PackageNotFoundError
  | DocgenConfigError
  | TsMorphError
  | DocgenProcessError
  | TsConfigNotFoundError
  | InvalidPackagePathError
  | AggregationError;
