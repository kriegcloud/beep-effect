/**
 * Tagged errors for the AIMetrics command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { CauseTaggedError, TaggedErrorClass } from "@beep/schema";
import { Err } from "@beep/utils";
import { Runtime } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/AIMetrics/AIMetrics.errors");

/**
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

/**
 * Silent non-zero status used after the status command has already rendered output.
 *
 * @example
 * ```ts
 * import { AiMetricsStatusExit } from "@beep/repo-cli/commands/AIMetrics/AIMetrics.errors"
 *
 * const error = AiMetricsStatusExit.new("AI metrics status failed.")
 * console.log(error.message)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsStatusExit extends TaggedErrorClass<AiMetricsStatusExit>($I`AiMetricsStatusExit`)(
  "AiMetricsStatusExit",
  {
    message: S.String,
  },
  $I.annote("AiMetricsStatusExit", {
    description: "Silent non-zero process exit requested after a command has already rendered its result.",
  })
) {
  /** Process exit code reported when this status sentinel reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = 1;

  /** Suppress duplicate runtime reporting after command output has already been rendered. */
  override readonly [Runtime.errorReported] = false;

  static readonly new = (message: string): AiMetricsStatusExit => AiMetricsStatusExit.make({ message });

  static readonly mapError = Err.mapToError(this.new);
}
