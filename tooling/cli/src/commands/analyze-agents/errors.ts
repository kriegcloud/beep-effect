/**
 * @file analyze-agents Command Error Classes
 *
 * Defines tagged error types for the analyze-agents CLI command.
 *
 * @module analyze-agents/errors
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/analyze-agents");

const CauseFields = {
  underlyingCause: S.optional(S.Unknown),
  stack: S.optional(S.String),
  operation: S.optional(S.String),
};

/**
 * Error indicating an analyze-agents operation failed.
 *
 * @since 0.1.0
 * @category errors
 */
export class AnalyzeAgentsError extends S.TaggedError<AnalyzeAgentsError>()($I`AnalyzeAgentsError`, {
  message: S.String,
  ...CauseFields,
}) {
  get displayMessage(): string {
    return `analyze-agents error: ${this.message}`;
  }
}

/**
 * Union of all analyze-agents errors for Effect error channel typing.
 *
 * @since 0.1.0
 * @category models
 */
export type AnalyzeAgentsCommandError = AnalyzeAgentsError;
