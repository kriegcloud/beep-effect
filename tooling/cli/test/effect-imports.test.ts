import { EffectImportRulesOptions, runEffectImportRules } from "@beep/repo-cli/commands/Laws/EffectImports";
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

const readProjectFile = Effect.fn(function* (relativePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* fs.readFileString(path.join(process.cwd(), relativePath));
});

const writeTsconfig = writeProjectFile(
  "tsconfig.json",
  ["{", '  "compilerOptions": {', '    "target": "ES2022",', '    "module": "ESNext"', "  }", "}"].join("\n")
);

describe("effect import laws", () => {
  it("flags stable submodule namespace imports in dry-run mode while ignoring unstable ones", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as Duration from "effect/Duration";',
              'import * as Command from "effect/unstable/cli";',
              "",
              "export const duration = Duration.seconds(1);",
              "export const command = Command.run;",
              "",
            ].join("\n")
          );

          const summary = yield* runEffectImportRules(
            new EffectImportRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.aliasRenamed).toBe(0);
          expect(summary.stableConverted).toBe(1);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(source).toContain('import * as Duration from "effect/Duration";');
          expect(source).toContain('import * as Command from "effect/unstable/cli";');
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("rewrites stable submodule namespace imports to root effect imports in write mode", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as Duration from "effect/Duration";',
              'import * as Command from "effect/unstable/cli";',
              "",
              "export const duration = Duration.seconds(1);",
              "export const command = Command.run;",
              "",
            ].join("\n")
          );

          const summary = yield* runEffectImportRules(
            new EffectImportRulesOptions({
              write: true,
              strictCheck: false,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.stableConverted).toBe(1);
          expect(summary.strictFailure).toBe(false);
          expect(source).toContain('import { Duration } from "effect";');
          expect(source).toContain('import * as Command from "effect/unstable/cli";');
          expect(source).not.toContain('import * as Duration from "effect/Duration";');
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
