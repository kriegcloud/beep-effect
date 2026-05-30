/**
 * Tagged errors for the Reuse command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Err } from "@beep/utils";
import { Inspectable } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Reuse/Reuse.errors");

const causeMessage = (cause: unknown): string =>
  P.isError(cause) ? cause.message : Inspectable.toStringUnknown(cause, 0);

/**
 * Lifecycle stages surfaced by the Codex smoke runner.
 *
 * @example
 * ```ts
 * import { CodexRunnerStage } from "@beep/repo-cli/commands/Reuse"
 * console.log(CodexRunnerStage)
 * ```
 * @category models
 * @since 0.0.0
 */
export const CodexRunnerStage = LiteralKit(["findRepoRoot", "import", "construct", "startThread"]).pipe(
  $I.annoteSchema("CodexRunnerStage", {
    description: "Bounded lifecycle stage used when the Codex smoke path fails.",
  })
);

/**
 * Runtime type for `CodexRunnerStage`.
 *
 * @category models
 * @since 0.0.0
 */
export type CodexRunnerStage = typeof CodexRunnerStage.Type;

/**
 * Structured error emitted when the Codex SDK smoke path fails.
 *
 * @example
 * ```ts
 * import { CodexRunnerError } from "@beep/repo-cli/commands/Reuse"
 * console.log(CodexRunnerError)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CodexRunnerError extends TaggedErrorClass<CodexRunnerError>($I`CodexRunnerError`)(
  "CodexRunnerError",
  {
    stage: CodexRunnerStage,
    message: S.NonEmptyString,
  },
  $I.annote("CodexRunnerError", {
    description: "Typed failure raised while validating the Codex SDK smoke path.",
  })
) {
  /**
   * Construct a Codex runner error for a lifecycle stage.
   *
   * @category constructors
   */
  static readonly new: {
    (stage: CodexRunnerStage, message: string): CodexRunnerError;
    (message: string): (stage: CodexRunnerStage) => CodexRunnerError;
  } = dual(2, (stage: CodexRunnerStage, message: string) =>
    CodexRunnerError.make({
      stage,
      message,
    })
  );

  static readonly mapError = Err.mapCauseError<CodexRunnerError, [stage: CodexRunnerStage, message?: string]>(
    (cause, stage, message) =>
      CodexRunnerError.new(stage, message === undefined ? causeMessage(cause) : `${message}: ${causeMessage(cause)}`)
  );
}
