/**
 * Codex SDK smoke helpers for the reuse command suite.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, type FileSystem } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Reuse/internal/CodexRunner");

/**
 * Structured result for `beep reuse codex-smoke`.
 *
 * @category DomainModel
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

/**
 * Structured error emitted when the Codex SDK smoke path fails.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CodexRunnerError extends TaggedErrorClass<CodexRunnerError>($I`CodexRunnerError`)(
  "CodexRunnerError",
  {
    stage: S.NonEmptyString,
    message: S.NonEmptyString,
  },
  $I.annote("CodexRunnerError", {
    description: "Typed failure raised while validating the Codex SDK smoke path.",
  })
) {}

/**
 * Validate the local Codex SDK adapter without running a reuse loop.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const runCodexSmoke: Effect.Effect<CodexSmokeResult, CodexRunnerError, FileSystem.FileSystem> = Effect.gen(
  function* () {
    const repoRoot = yield* findRepoRoot().pipe(
      Effect.mapError(
        (cause) =>
          new CodexRunnerError({
            stage: "findRepoRoot",
            message: cause.message,
          })
      )
    );
    const sdkModule = yield* Effect.tryPromise({
      try: () => import("@openai/codex-sdk"),
      catch: (cause) =>
        new CodexRunnerError({
          stage: "import",
          message: cause instanceof Error ? cause.message : "Failed to import @openai/codex-sdk",
        }),
    });
    const codex = yield* Effect.try({
      try: () => new sdkModule.Codex(),
      catch: (cause) =>
        new CodexRunnerError({
          stage: "construct",
          message: cause instanceof Error ? cause.message : "Failed to construct Codex SDK client",
        }),
    });
    const thread = yield* Effect.tryPromise({
      try: () =>
        Promise.resolve(
          codex.startThread({
            workingDirectory: repoRoot,
            skipGitRepoCheck: true,
          })
        ),
      catch: (cause) =>
        new CodexRunnerError({
          stage: "startThread",
          message: cause instanceof Error ? cause.message : "Failed to start Codex SDK thread",
        }),
    });

    return new CodexSmokeResult({
      sdkPackage: "@openai/codex-sdk",
      workingDirectory: repoRoot,
      threadCreated: true,
      threadRunMethodAvailable: typeof thread.run === "function",
      note: "The smoke path validates SDK import and thread startup only. It does not execute an agent loop.",
    });
  }
);
