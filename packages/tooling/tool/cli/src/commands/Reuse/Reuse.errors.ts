/**
 * Tagged errors for the Reuse command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Reuse/Reuse.errors");

/**
 * Lifecycle stages surfaced by the Codex smoke runner.
 *
 * @category models
 * @since 0.0.0
 */
export const CodexRunnerStage = LiteralKit(["findRepoRoot", "import", "construct", "startThread"]).pipe(
  S.annotate(
    $I.annote("CodexRunnerStage", {
      description: "Bounded lifecycle stage used when the Codex smoke path fails.",
    })
  )
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
) {}
