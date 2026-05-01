import { lintCommand } from "@beep/repo-cli";
import { FsUtilsLive } from "@beep/repo-utils/FsUtils";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const runLintCommand = Command.runWith(lintCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

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

const writePackage = Effect.fn(function* (packageDir: string, packageName: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
  yield* fs.writeFileString(
    path.join(packageDir, "package.json"),
    `${encodeJson({
      name: packageName,
      version: "0.0.0",
      type: "module",
    })}\n`
  );
});

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

describe.sequential("package test import lint command", () => {
  it("reports same-package relative imports into src", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const packageDir = path.join("packages", "common", "example");

          yield* writePackage(packageDir, "@beep/example");
          yield* fs.makeDirectory(path.join(packageDir, "test"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "test", "Example.test.ts"),
            `import { example } from "../src/index.ts";\nvoid example;\n`
          );

          yield* runLintCommand(["package-test-imports"]);

          const errorLines = yield* TestConsole.errorLines;
          expect(errorLines).toContain(
            "[check-package-test-imports] relative imports from package test/dtslint files into workspace src are not allowed. Use @beep/* package aliases."
          );
          expect(errorLines).toContain(
            "packages/common/example/test/Example.test.ts:1 ../src/index.ts -> @beep/example"
          );
          expect(process.exitCode).toBe(1);
        })
      ).pipe(Effect.provide(testLayer))
    );
  }, 5_000);

  it("reports cross-package relative imports into src", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const producerDir = path.join("packages", "common", "producer");
          const consumerDir = path.join("packages", "common", "consumer");

          yield* writePackage(producerDir, "@beep/producer");
          yield* writePackage(consumerDir, "@beep/consumer");
          yield* fs.makeDirectory(path.join(consumerDir, "dtslint"), { recursive: true });
          yield* fs.writeFileString(
            path.join(consumerDir, "dtslint", "Consumer.tst.ts"),
            `import type { Producer } from "../../producer/src/Producer.ts";\ntype _ = Producer;\n`
          );

          yield* runLintCommand(["package-test-imports"]);

          const errorLines = yield* TestConsole.errorLines;
          expect(errorLines).toContain(
            "packages/common/consumer/dtslint/Consumer.tst.ts:1 ../../producer/src/Producer.ts -> @beep/producer/Producer"
          );
          expect(process.exitCode).toBe(1);
        })
      ).pipe(Effect.provide(testLayer))
    );
  }, 5_000);

  it("allows relative imports to local test fixtures", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const packageDir = path.join("packages", "common", "example");

          yield* writePackage(packageDir, "@beep/example");
          yield* fs.makeDirectory(path.join(packageDir, "test", "fixtures"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "test", "fixtures", "src-helper.ts"),
            "export const helper = 1;\n"
          );
          yield* fs.writeFileString(
            path.join(packageDir, "test", "Example.test.ts"),
            `import { helper } from "./fixtures/src-helper.ts";\nvoid helper;\n`
          );

          yield* runLintCommand(["package-test-imports"]);

          const logLines = yield* TestConsole.logLines;
          const errorLines = yield* TestConsole.errorLines;
          expect(logLines).toEqual([
            "[check-package-test-imports] OK: package test/dtslint imports use package aliases.",
          ]);
          expect(errorLines).toEqual([]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  }, 5_000);

  it("allows internal package alias imports", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const packageDir = path.join("packages", "common", "example");

          yield* writePackage(packageDir, "@beep/example");
          yield* fs.makeDirectory(path.join(packageDir, "test"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "test", "Example.test.ts"),
            `import { Hidden } from "@beep/example/internal/Hidden";\nvoid Hidden;\n`
          );

          yield* runLintCommand(["package-test-imports"]);

          const logLines = yield* TestConsole.logLines;
          const errorLines = yield* TestConsole.errorLines;
          expect(logLines).toEqual([
            "[check-package-test-imports] OK: package test/dtslint imports use package aliases.",
          ]);
          expect(errorLines).toEqual([]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  }, 5_000);
});
