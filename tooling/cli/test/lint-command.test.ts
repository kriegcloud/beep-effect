import { lintCommand } from "@beep/repo-cli";
import { FsUtilsLive } from "@beep/repo-utils/FsUtils";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const runLintCommand = Command.runWith(lintCommand, { version: "0.0.0" });

const testLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  FsUtilsLive.pipe(Layer.provide(NodeServices.layer))
);

const withTempWorkingDirectory = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousExitCode = process.exitCode;

      process.chdir(tmpDir);
      process.exitCode = undefined;

      return { fs, previousCwd, previousExitCode, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, previousExitCode, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        process.exitCode = previousExitCode;
        yield* fs.remove(tmpDir, { recursive: true });
      })
  );

describe("lint command file discovery", () => {
  it("ignores symlinked directories that point outside the repo root", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const sourceRoot = path.join("tooling", "example", "src");
          const outsideRoot = "outside";

          yield* fs.makeDirectory(sourceRoot, { recursive: true });
          yield* fs.makeDirectory(outsideRoot, { recursive: true });
          yield* fs.writeFileString(path.join(sourceRoot, "Main.ts"), "export const safe = true;\n");
          yield* fs.writeFileString(path.join(outsideRoot, "Bad.ts"), "const failure = new Error('outside');\n");
          yield* fs.symlink(path.resolve(outsideRoot), path.join(sourceRoot, "escape"));

          yield* runLintCommand(["tooling-tagged-errors"]);

          const logLines = yield* TestConsole.logLines;
          const errorLines = yield* TestConsole.errorLines;

          expect(logLines).toEqual(["[check-tooling-tagged-errors] OK: no native Error usage found in tooling/*/src."]);
          expect(errorLines).toEqual([]);
          expect(process.exitCode).toBeUndefined();
        })
      ).pipe(Effect.provide(testLayer))
    );
  }, 5_000);

  it("does not recurse into symlink loops", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const sourceRoot = path.join("tooling", "example", "src");

          yield* fs.makeDirectory(sourceRoot, { recursive: true });
          yield* fs.writeFileString(path.join(sourceRoot, "Main.ts"), "export const safe = true;\n");
          yield* fs.symlink(path.resolve(sourceRoot), path.join(sourceRoot, "loop"));

          yield* runLintCommand(["tooling-tagged-errors"]);

          const logLines = yield* TestConsole.logLines;
          const errorLines = yield* TestConsole.errorLines;

          expect(logLines).toEqual(["[check-tooling-tagged-errors] OK: no native Error usage found in tooling/*/src."]);
          expect(errorLines).toEqual([]);
          expect(process.exitCode).toBeUndefined();
        })
      ).pipe(Effect.provide(testLayer))
    );
  }, 5_000);
});
