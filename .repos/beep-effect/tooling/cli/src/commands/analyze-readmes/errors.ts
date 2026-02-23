/**
 * @file analyze-readmes Command Error Classes
 *
 * Defines tagged error types for the analyze-readmes CLI command.
 *
 * @module analyze-readmes/errors
 * @since 0.1.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

/**
 * Identity composer for analyze-readmes command errors.
 */
const $I = $RepoCliId.create("commands/analyze-readmes");

/**
 * Common cause fields for error context.
 */
const CauseFields = {
  underlyingCause: S.optional(S.Unknown),
  stack: S.optional(S.String),
  operation: S.optional(S.String),
};

/**
 * Error indicating a failure in the analyze-readmes command.
 *
 * @since 0.1.0
 * @category errors
 */
export class AnalyzeReadmesError extends S.TaggedError<AnalyzeReadmesError>()($I`AnalyzeReadmesError`, {
  message: S.String,
  ...CauseFields,
}) {
  get displayMessage(): string {
    return `analyze-readmes error: ${this.message}`;
  }
}

/**
 * Union of all analyze-readmes errors for Effect error channel typing.
 *
 * @since 0.1.0
 * @category models
 */
export type AnalyzeReadmesCommandError = AnalyzeReadmesError;
