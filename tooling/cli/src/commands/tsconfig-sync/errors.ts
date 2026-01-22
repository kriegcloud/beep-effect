/**
 * @file tsconfig-sync Command Error Classes
 *
 * Defines tagged error types for the tsconfig-sync CLI command.
 * Uses CyclicDependencyError from @beep/tooling-utils for cycle detection.
 *
 * @module tsconfig-sync/errors
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

// Re-export CyclicDependencyError from tooling-utils (P0b)
export { CyclicDependencyError } from "@beep/tooling-utils";

/**
 * Identity composer for tsconfig-sync command errors.
 */
const $I = $RepoCliId.create("commands/tsconfig-sync");

/**
 * Error indicating configuration drift was detected in check mode.
 *
 * @since 0.1.0
 * @category errors
 */
export class DriftDetectedError extends S.TaggedError<DriftDetectedError>()($I`DriftDetectedError`, {
  /** Number of files with drift */
  fileCount: S.Number,
  /** Summary of changes needed */
  summary: S.String,
}) {
  get displayMessage(): string {
    return `Configuration drift detected: ${this.fileCount} file(s) need updating. ${this.summary}`;
  }
}

/**
 * Error indicating a tsconfig file operation failed.
 *
 * @since 0.1.0
 * @category errors
 */
export class TsconfigSyncError extends S.TaggedError<TsconfigSyncError>()($I`TsconfigSyncError`, {
  /** Path to the file that failed */
  filePath: S.String,
  /** The operation that failed */
  operation: S.String,
  /** Underlying error cause */
  cause: S.optional(S.Unknown),
}) {
  get displayMessage(): string {
    return `tsconfig-sync error in ${this.filePath} during ${this.operation}`;
  }
}

/**
 * Union of all tsconfig-sync errors for Effect error channel typing.
 *
 * @since 0.1.0
 * @category models
 */
export type TsconfigSyncCommandError = DriftDetectedError | TsconfigSyncError;
