import { agentsCommand } from "@beep/repo-cli/commands/Agents/index";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const runAgentsCommand = Command.runWith(agentsCommand, { version: "0.0.0" });

const testLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);

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

describe("agents check", () => {
  it("reports a missing manifest as skipped in non-strict mode", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const expectedManifestPath = path.resolve(".beep/manifests/managed-files.json");

          yield* runAgentsCommand(["check"]);

          const logLines = yield* TestConsole.logLines;
          const errorLines = yield* TestConsole.errorLines;

          expect(logLines).toEqual([
            `[agents-check] skipped: no managed-files manifest at ${expectedManifestPath} (non-strict mode)`,
          ]);
          expect(errorLines).toEqual([]);
          expect(process.exitCode).toBeUndefined();
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("fails when the manifest is missing in strict mode", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const expectedManifestPath = path.resolve(".beep/manifests/managed-files.json");

          yield* runAgentsCommand(["check", "--strict"]);

          const logLines = yield* TestConsole.logLines;
          const errorLines = yield* TestConsole.errorLines;

          expect(logLines).toEqual([]);
          expect(errorLines).toEqual([`[agents-check] manifest missing: ${expectedManifestPath}`]);
          expect(process.exitCode).toBe(1);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
