/**
 * Typed errors for provider CLI probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiProviderCliId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiProviderCliId.create("AiProviderCli.errors");

/**
 * Technical provider CLI failure.
 *
 * @category errors
 * @since 0.0.0
 */
export class AiProviderCliError extends TaggedErrorClass<AiProviderCliError>($I`AiProviderCliError`)(
  "AiProviderCliError",
  {
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
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
