/**
 * Codex SDK smoke helpers for the reuse command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { Effect, type FileSystem } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { CodexRunnerError } from "../Reuse.errors.js";

/**
 * Public Codex runner smoke error exports.
 *
 * @category errors
 * @since 0.0.0
 */
export { CodexRunnerError, CodexRunnerStage } from "../Reuse.errors.js";

const $I = $RepoCliId.create("commands/Reuse/internal/CodexRunner");

/**
 * Structured result for `beep reuse codex-smoke`.
 *
 * @category models
 * @since 0.0.0
 */
export class CodexSmokeResult extends S.Class<CodexSmokeResult>($I`CodexSmokeResult`)(
  {
    sdkPackage: S.NonEmptyString,
    workingDirectory: S.NonEmptyString,
    threadCreated: S.Boolean,
    threadRunMethodAvailable: S.Boolean,
    note: S.NonEmptyString,
  },
  $I.annote("CodexSmokeResult", {
    description: "Smoke-test result for the Codex SDK adapter used by reuse tooling.",
  })
) {}

const causeMessage = (cause: unknown, fallback: string): string => (P.isError(cause) ? cause.message : fallback);

/**
 * Validate the local Codex SDK adapter without running a reuse loop.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const runCodexSmoke: Effect.Effect<CodexSmokeResult, CodexRunnerError, FileSystem.FileSystem> = Effect.gen(
  function* () {
    const repoRoot = yield* findRepoRoot().pipe(CodexRunnerError.mapError("findRepoRoot"));
    const sdkModule = yield* Effect.tryPromise({
      try: () => import("@openai/codex-sdk"),
      catch: (cause) => CodexRunnerError.new("import", causeMessage(cause, "Failed to import @openai/codex-sdk")),
    });
    const codex = yield* Effect.try({
      try: () => new sdkModule.Codex(),
      catch: (cause) => CodexRunnerError.new("construct", causeMessage(cause, "Failed to construct Codex SDK client")),
    });
    const thread = yield* Effect.tryPromise({
      try: () =>
        Promise.resolve(
          codex.startThread({
            workingDirectory: repoRoot,
            skipGitRepoCheck: true,
          })
        ),
      catch: (cause) => CodexRunnerError.new("startThread", causeMessage(cause, "Failed to start Codex SDK thread")),
    });

    return CodexSmokeResult.make({
      sdkPackage: "@openai/codex-sdk",
      workingDirectory: repoRoot,
      threadCreated: true,
      threadRunMethodAvailable: P.isFunction(thread.run),
      note: "The smoke path validates SDK import and thread startup only. It does not execute an agent loop.",
    });
  }
);
