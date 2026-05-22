/**
 * Tagged errors for the Codex command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Runtime } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Codex/Codex.errors"); /**
 * Typed failure for Codex helper commands.
 *
 * @example
 * ```ts
 * import { CodexCommandError } from "@beep/repo-cli/commands/Codex"
 * const error = new CodexCommandError({ message: "failed" })
 * ```
 * @category errors
 * @since 0.0.0
 */
export class CodexCommandError extends TaggedErrorClass<CodexCommandError>($I`CodexCommandError`)(
  "CodexCommandError",
  {
    message: S.String,
    exitCode: S.optionalKey(S.Number),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("CodexCommandError", {
    description: "Failure raised by Codex helper commands.",
  })
) {
  /** Process exit code reported when this error reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = this.exitCode ?? 1;
}
