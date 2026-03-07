/**
 * @file peer-deps-sync Command Error Classes
 *
 * Defines tagged error types for the peer-deps-sync CLI command.
 *
 * @module peer-deps-sync/errors
 * @since 0.1.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/peer-deps-sync");

/**
 * Error indicating peer dependency drift was detected in check mode.
 *
 * @since 0.1.0
 * @category errors
 */
export class DriftDetectedError extends S.TaggedError<DriftDetectedError>()($I`DriftDetectedError`, {
  fileCount: S.Number,
  summary: S.String,
}) {
  get displayMessage(): string {
    return `Peer dependency drift detected: ${this.fileCount} package(s) need updating. ${this.summary}`;
  }
}

/**
 * Error indicating a peer-deps-sync file operation failed.
 *
 * @since 0.1.0
 * @category errors
 */
export class PeerDepsSyncError extends S.TaggedError<PeerDepsSyncError>()($I`PeerDepsSyncError`, {
  filePath: S.String,
  operation: S.String,
  cause: S.optional(S.Unknown),
}) {
  get displayMessage(): string {
    return `peer-deps-sync error in ${this.filePath} during ${this.operation}`;
  }
}

/**
 * Error indicating the live reference repository could not be found.
 *
 * @since 0.1.0
 * @category errors
 */
export class ReferenceRepoNotFoundError extends S.TaggedError<ReferenceRepoNotFoundError>()(
  $I`ReferenceRepoNotFoundError`,
  {
    referencePath: S.String,
    defaultPath: S.String,
    envVar: S.String,
  }
) {
  get displayMessage(): string {
    return [
      `Reference repo not found at ${this.referencePath}.`,
      `Expected default path: ${this.defaultPath}.`,
      `Override with ${this.envVar}=<path>.`,
    ].join(" ");
  }
}

/**
 * Error indicating git staged-file inspection failed.
 *
 * @since 0.1.0
 * @category errors
 */
export class GitStateError extends S.TaggedError<GitStateError>()($I`GitStateError`, {
  operation: S.String,
  cause: S.optional(S.Unknown),
}) {
  get displayMessage(): string {
    return `peer-deps-sync git error during ${this.operation}`;
  }
}

/**
 * Union of all peer-deps-sync errors for Effect error channel typing.
 *
 * @since 0.1.0
 * @category models
 */
export type PeerDepsSyncCommandError =
  | DriftDetectedError
  | PeerDepsSyncError
  | ReferenceRepoNotFoundError
  | GitStateError;
