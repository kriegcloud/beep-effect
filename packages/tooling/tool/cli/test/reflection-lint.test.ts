import { lintCommand } from "@beep/repo-cli";
import { FsUtilsLive } from "@beep/repo-utils/FsUtils";
import { NodeServices } from "@effect/platform-node";
import { Cause, Effect, Exit, FileSystem, Layer, Path, Runtime } from "effect";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const runLintCommand = Command.runWith(lintCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const expectReportedFailure = (exit: Exit.Exit<unknown, unknown>) => {
  expect(Exit.isFailure(exit)).toBe(true);
  if (Exit.isFailure(exit)) {
    const error = Cause.squash(exit.cause);
    expect(Runtime.getErrorExitCode(error)).toBe(1);
  }
};

const testLayer = Layer.mergeAll(NodeServices.layer, FsUtilsLive.pipe(Layer.provide(NodeServices.layer)));

const withTempWorkingDirectory = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      process.chdir(tmpDir);
      return { fs, previousCwd, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        yield* fs.remove(tmpDir, { recursive: true });
      })
  );

const writeCompletedGoal = Effect.fn("writeCompletedGoal")(function* (slug: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.join("goals", slug, "ops"), { recursive: true });
  yield* fs.writeFileString(
    path.join("goals", slug, "ops", "manifest.json"),
    `${encodeJson({
      schemaVersion: "initiative-manifest/v1",
      initiative: { id: slug, title: slug, status: "completed-retained" },
      reflectionRequired: true,
    })}\n`
  );
});

const VALID_REFLECTION = `---
goal: example
agent: claude
date: 2026-06-09
trigger: closeout
confidence: high
findings:
  - category: tooling-friction
    confidence: medium
    instruction: Do the thing.
    explanation: Because of the evidence.
todos:
  - Codify the thing.
---

# Reflection
`;

const writeReflection = Effect.fn("writeReflection")(function* (slug: string, file: string, body: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.join("goals", slug, "history", "reflections"), { recursive: true });
  yield* fs.writeFileString(path.join("goals", slug, "history", "reflections", file), body);
});

describe("reflection-artifacts lint command", { concurrent: false }, () => {
  it(
    "blocks a reflectionRequired completed goal with no reflection artifact",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            yield* writeCompletedGoal("example");
            const exit = yield* Effect.exit(runLintCommand(["reflection-artifacts"]));
            expectReportedFailure(exit);
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    20_000
  );

  it(
    "passes when a schema-valid reflection artifact is present",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            yield* writeCompletedGoal("example");
            yield* writeReflection("example", "2026-06-09-claude.md", VALID_REFLECTION);
            const exit = yield* Effect.exit(runLintCommand(["reflection-artifacts"]));
            expect(Exit.isSuccess(exit)).toBe(true);
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    20_000
  );

  it(
    "blocks when a reflection artifact has invalid frontmatter",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            yield* writeCompletedGoal("example");
            yield* writeReflection("example", "2026-06-09-claude.md", "# no frontmatter here\n");
            const exit = yield* Effect.exit(runLintCommand(["reflection-artifacts"]));
            expectReportedFailure(exit);
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    20_000
  );
});
