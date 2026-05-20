/**
 * Codex agent helper commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { TaggedErrorClass } from "@beep/schema";
import { A } from "@beep/utils";
import { Console, Effect, type FileSystem, Runtime, Stream } from "effect";
import * as S from "effect/Schema";
import { Argument, Command } from "effect/unstable/cli";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";

const $I = $RepoCliId.create("commands/Codex");
const textEncoder = new TextEncoder();

/**
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
  override readonly [Runtime.errorExitCode] = this.exitCode ?? 1;
}

const defaultInitiativeSummary =
  "Infer the initiative being closed from the current branch, git status, and changed surface.";

const qualityReviewPrompt = (initiativeSummary: string): string => `Use $quality-review-fix-loop.

Initiative summary:
${initiativeSummary}

Start by inspecting the current git state and changed surface. Follow the
repo-local skill exactly. Do not push, open a PR, reply to GitHub review
threads, or publish anything unless the user explicitly requested that in the
initiative summary.
`;

/**
 * Launch Codex with the repo-local quality review fix loop prompt.
 *
 * @param summaryParts - Optional initiative summary words.
 * @returns Effect that runs `codex exec`.
 * @example
 * ```ts
 * import { runCodexQualityReviewFixLoop } from "@beep/repo-cli/commands/Codex"
 * const program = runCodexQualityReviewFixLoop(["close", "current", "initiative"])
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runCodexQualityReviewFixLoop = Effect.fn("Codex.runCodexQualityReviewFixLoop")(function* (
  summaryParts: ReadonlyArray<string>
): Effect.fn.Return<void, CodexCommandError, FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner> {
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => new CodexCommandError({ message: "Failed to locate repository root.", cause }))
  );
  const initiativeSummary = A.isReadonlyArrayEmpty(summaryParts) ? defaultInitiativeSummary : A.join(summaryParts, " ");
  const prompt = qualityReviewPrompt(initiativeSummary);
  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make("codex", ["exec", "--cd", repoRoot, "-"], {
        cwd: repoRoot,
        stdin: Stream.make(textEncoder.encode(prompt)),
        stdout: "inherit",
        stderr: "inherit",
      });

      return yield* handle.exitCode;
    })
  ).pipe(
    Effect.mapError(
      (cause) =>
        new CodexCommandError({
          message: "Failed to spawn codex quality-review-fix-loop.",
          cause,
        })
    )
  );

  if (exitCode !== 0) {
    return yield* new CodexCommandError({
      message: `codex quality-review-fix-loop failed with exit code ${exitCode}.`,
      exitCode,
    });
  }
});

const qualityReviewFixLoopCommand = Command.make(
  "quality-review-fix-loop",
  {
    summary: Argument.string("summary").pipe(Argument.variadic),
  },
  ({ summary }) => runCodexQualityReviewFixLoop(summary as ReadonlyArray<string>)
).pipe(Command.withDescription("Run Codex with the repo quality-review-fix-loop skill"));

/**
 * Codex helper command group.
 *
 * @example
 * ```ts
 * console.log("codexCommand")
 * ```
 * @category cli-commands
 * @since 0.0.0
 */
export const codexCommand = Command.make(
  "codex",
  {},
  Effect.fn(function* () {
    yield* Console.log("Codex commands:");
    yield* Console.log("- bun run beep codex quality-review-fix-loop");
  })
).pipe(Command.withDescription("Codex agent helper commands"), Command.withSubcommands([qualityReviewFixLoopCommand]));
