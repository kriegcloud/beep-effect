import { NoNativeRuntimeRulesOptions, runNoNativeRuntimeRules } from "@beep/repo-cli/commands/Laws/NoNativeRuntime";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(NodeServices.layer);

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

const writeProjectFile = Effect.fn(function* (relativePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.join(process.cwd(), relativePath);
  const directoryPath = path.dirname(absolutePath);

  yield* fs.makeDirectory(directoryPath, { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});

const writeTsconfig = writeProjectFile(
  "tsconfig.json",
  ["{", '  "compilerOptions": {', '    "target": "ES2022",', '    "module": "ESNext"', "  }", "}"].join("\n")
);

describe("native runtime laws", () => {
  it("keeps non-hotspot findings as warnings in strict check mode", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile("packages/demo/src/index.ts", "export const value = new Date();\n");

          const summary = yield* runNoNativeRuntimeRules(
            new NoNativeRuntimeRulesOptions({
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.scannedFiles).toBe(1);
          expect(summary.touchedFiles).toBe(1);
          expect(summary.warningCount).toBe(1);
          expect(summary.errorCount).toBe(0);
          expect(summary.strictFailure).toBe(false);
          expect(summary.affectedFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.diagnostics.map((diagnostic) => diagnostic.severity)).toEqual(["warn"]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("fails strict check for hotspot-native runtime violations", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "tooling/cli/src/commands/Lint/index.ts",
            'export const fail = () => { throw new Error("boom"); };\n'
          );

          const summary = yield* runNoNativeRuntimeRules(
            new NoNativeRuntimeRulesOptions({
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.warningCount).toBe(0);
          expect(summary.errorCount).toBe(1);
          expect(summary.strictFailure).toBe(true);
          expect(summary.affectedFiles).toEqual(["tooling/cli/src/commands/Lint/index.ts"]);
          expect(summary.diagnostics.map((diagnostic) => diagnostic.severity)).toEqual(["error"]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("suppresses allowlisted map-set constructors by snapshot path and kind", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/common/chalk/src/internal/ChalkRuntime.ts",
            "export const cache = new WeakMap<object, string>();\n"
          );

          const summary = yield* runNoNativeRuntimeRules(
            new NoNativeRuntimeRulesOptions({
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.warningCount).toBe(0);
          expect(summary.errorCount).toBe(0);
          expect(summary.strictFailure).toBe(false);
          expect(summary.touchedFiles).toBe(0);
          expect(summary.affectedFiles).toEqual([]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
