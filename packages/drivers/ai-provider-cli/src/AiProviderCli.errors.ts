/**
 * Typed failure payloads for Claude and Codex CLI auth probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiProviderCliId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiProviderCliId.create("AiProviderCli.errors");

/**
 * Redacted technical failure from a provider CLI status probe.
 *
 * @remarks
 * The error keeps the provider, operation, command, and optional process
 * details needed for diagnostics. Callers should continue treating stdout and
 * stderr as redacted diagnostic text, not as a stable account-status API.
 *
 * @example
 * ```ts
 * import { AiProviderCliError } from "@beep/ai-provider-cli"
 *
 * const error = AiProviderCliError.make({
 *   command: "claude",
 *   exitCode: 127,
 *   message: "Failed to execute provider CLI status command.",
 *   operation: "checkAuth",
 *   provider: "claude",
 *   stderr: "command not found"
 * })
 *
 * console.log(error.operation) // "checkAuth"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AiProviderCliError extends TaggedErrorClass<AiProviderCliError>($I`AiProviderCliError`)(
  "AiProviderCliError",
  {
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Finite),
    message: S.String,
    operation: S.String,
    provider: S.String,
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("AiProviderCliError", {
    description: "Redacted technical failure emitted by Claude or Codex CLI status probes.",
  })
) {}
