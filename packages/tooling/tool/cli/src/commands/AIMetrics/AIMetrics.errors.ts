/**
 * Tagged errors for the AIMetrics command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { CauseTaggedError, TaggedErrorClass } from "@beep/schema";
import { Runtime } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/AIMetrics/AIMetrics.errors"); /**
 * Error raised by the AI metrics CLI.
 *
 * @example
 * ```ts
 * import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index"
 * console.log(aiMetricsCommand)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsCommandError extends CauseTaggedError<AiMetricsCommandError>($I`AiMetricsCommandError`)(
  "AiMetricsCommandError",
  {},
  $I.annote("AiMetricsCommandError", {
    description: "User-facing failure raised by the AI metrics CLI command suite.",
  })
) {}

export class AiMetricsStatusExit extends TaggedErrorClass<AiMetricsStatusExit>($I`AiMetricsStatusExit`)(
  "AiMetricsStatusExit",
  {
    message: S.String,
  },
  $I.annote("AiMetricsStatusExit", {
    description: "Silent non-zero process exit requested after a command has already rendered its result.",
  })
) {
  override readonly [Runtime.errorExitCode] = 1;
  override readonly [Runtime.errorReported] = false;
}
