/**
 * @file Context-Freshness Error Types
 *
 * Defines tagged error types for the context-freshness command.
 *
 * @module context-freshness/errors
 * @since 0.1.0
 */

import * as S from "effect/Schema";

/**
 * Error when a scanned directory does not exist.
 *
 * @since 0.1.0
 * @category errors
 */
export class DirectoryNotFoundError extends S.TaggedError<DirectoryNotFoundError>()("DirectoryNotFoundError", {
  path: S.String,
  message: S.String,
}) {}

/**
 * Error when freshness check fails.
 *
 * @since 0.1.0
 * @category errors
 */
export class FreshnessCheckError extends S.TaggedError<FreshnessCheckError>()("FreshnessCheckError", {
  message: S.String,
  cause: S.optional(S.String),
}) {}

/**
 * Error when git command fails.
 *
 * @since 0.1.0
 * @category errors
 */
export class GitCommandError extends S.TaggedError<GitCommandError>()("GitCommandError", {
  command: S.String,
  message: S.String,
}) {}

/**
 * Error when critical staleness is detected.
 *
 * @since 0.1.0
 * @category errors
 */
export class CriticalStalenessError extends S.TaggedError<CriticalStalenessError>()("CriticalStalenessError", {
  message: S.String,
  criticalCount: S.Number,
}) {}

/**
 * Union of all context-freshness errors.
 *
 * @since 0.1.0
 * @category errors
 */
export type ContextFreshnessError =
  | DirectoryNotFoundError
  | FreshnessCheckError
  | GitCommandError
  | CriticalStalenessError;
