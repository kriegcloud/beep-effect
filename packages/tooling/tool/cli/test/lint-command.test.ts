import { lintCommand } from "@beep/repo-cli";
import { FsUtilsLive } from "@beep/repo-utils/FsUtils";
import { NodeServices } from "@effect/platform-node";
import { Cause, Effect, Exit, FileSystem, Layer, Path, Runtime } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const runLintCommand = Command.runWith(lintCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const expectReportedExit = (exit: Exit.Exit<unknown, unknown>, exitCode = 1) => {
  expect(Exit.isFailure(exit)).toBe(true);
  if (Exit.isFailure(exit)) {
    const error = Cause.squash(exit.cause);
    expect(Runtime.getErrorExitCode(error)).toBe(exitCode);
    expect(Runtime.getErrorReported(error)).toBe(false);
  }
};

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
  it(
    "ignores symlinked directories that point outside the repo root",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const sourceRoot = path.join("packages", "tooling", "tool", "example", "src");
            const outsideRoot = "outside";

            yield* fs.makeDirectory(sourceRoot, { recursive: true });
            yield* fs.makeDirectory(outsideRoot, { recursive: true });
            yield* fs.writeFileString(path.join(sourceRoot, "Main.ts"), "export const safe = true;\n");
            yield* fs.writeFileString(path.join(outsideRoot, "Bad.ts"), "const failure = new Error('outside');\n");
            yield* fs.symlink(path.resolve(outsideRoot), path.join(sourceRoot, "escape"));

            yield* runLintCommand(["tooling-tagged-errors"]);

            const logLines = yield* TestConsole.logLines;
            const errorLines = yield* TestConsole.errorLines;

            expect(logLines).toEqual([
              "[check-tooling-tagged-errors] OK: no native Error usage found in packages/tooling/*/*/src.",
            ]);
            expect(errorLines).toEqual([]);
            expect(process.exitCode).toBeUndefined();
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );

  it(
    "does not recurse into symlink loops",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const sourceRoot = path.join("packages", "tooling", "tool", "example", "src");

            yield* fs.makeDirectory(sourceRoot, { recursive: true });
            yield* fs.writeFileString(path.join(sourceRoot, "Main.ts"), "export const safe = true;\n");
            yield* fs.symlink(path.resolve(sourceRoot), path.join(sourceRoot, "loop"));

            yield* runLintCommand(["tooling-tagged-errors"]);

            const logLines = yield* TestConsole.logLines;
            const errorLines = yield* TestConsole.errorLines;

            expect(logLines).toEqual([
              "[check-tooling-tagged-errors] OK: no native Error usage found in packages/tooling/*/*/src.",
            ]);
            expect(errorLines).toEqual([]);
            expect(process.exitCode).toBeUndefined();
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );
});

describe.sequential("schema-first lint command", () => {
  it(
    "reports redundant LiteralKit const assertions",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;

            yield* fs.writeFileString(
              "package.json",
              `${encodeJson({
                name: "@beep/test-root",
                private: true,
                type: "module",
                workspaces: ["packages/*"],
              })}\n`
            );
            yield* fs.writeFileString("tsconfig.json", `${encodeJson({ compilerOptions: {} })}\n`);
            yield* fs.makeDirectory(path.join("packages", "example", "src"), { recursive: true });
            yield* fs.writeFileString(
              path.join("packages", "example", "src", "Example.ts"),
              `import { LiteralKit } from "@beep/schema";\nconst Status = LiteralKit(["active", "inactive"] as const);\nvoid Status;\n`
            );

            const exit = yield* Effect.exit(runLintCommand(["schema-first"]));

            const errorLines = yield* TestConsole.errorLines;
            expectReportedExit(exit);
            expect(errorLines).toContain("[schema-first] redundant LiteralKit const assertions:");
            expect(errorLines).toContain(
              "- packages/example/src/Example.ts:2 arg1 [literal-kit-const-assertion] Inline LiteralKit array arguments do not need as const."
            );
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );

  it(
    "accepts direct LiteralKit inline arrays without const assertions",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;

            yield* fs.writeFileString(
              "package.json",
              `${encodeJson({
                name: "@beep/test-root",
                private: true,
                type: "module",
                workspaces: ["packages/*"],
              })}\n`
            );
            yield* fs.writeFileString("tsconfig.json", `${encodeJson({ compilerOptions: {} })}\n`);
            yield* fs.makeDirectory(path.join("packages", "example", "src"), { recursive: true });
            yield* fs.writeFileString(
              path.join("packages", "example", "src", "Example.ts"),
              `import { LiteralKit } from "@beep/schema";\nconst Status = LiteralKit(["active", "inactive"]);\nvoid Status;\n`
            );

            yield* runLintCommand(["schema-first"]);

            const errorLines = yield* TestConsole.errorLines;
            expect(errorLines).toEqual([]);
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );
});

describe.sequential("package test import lint command", () => {
  it(
    "reports same-package relative imports into src",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const packageDir = path.join("packages", "foundation", "modeling", "example");

            yield* writePackage(packageDir, "@beep/example");
            yield* fs.makeDirectory(path.join(packageDir, "test"), { recursive: true });
            yield* fs.writeFileString(
              path.join(packageDir, "test", "Example.test.ts"),
              `import { example } from "../src/index.ts";\nvoid example;\n`
            );

            const exit = yield* Effect.exit(runLintCommand(["package-test-imports"]));

            const errorLines = yield* TestConsole.errorLines;
            expectReportedExit(exit);
            expect(errorLines).toContain(
              "[check-package-test-imports] relative imports from package test/dtslint files into workspace src are not allowed. Use @beep/* package aliases."
            );
            expect(errorLines).toContain(
              "packages/foundation/modeling/example/test/Example.test.ts:1 ../src/index.ts -> @beep/example"
            );
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );

  it(
    "reports cross-package relative imports into src",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const producerDir = path.join("packages", "foundation", "modeling", "producer");
            const consumerDir = path.join("packages", "foundation", "modeling", "consumer");

            yield* writePackage(producerDir, "@beep/producer");
            yield* writePackage(consumerDir, "@beep/consumer");
            yield* fs.makeDirectory(path.join(consumerDir, "dtslint"), { recursive: true });
            yield* fs.writeFileString(
              path.join(consumerDir, "dtslint", "Consumer.tst.ts"),
              `import type { Producer } from "../../producer/src/Producer.ts";\ntype _ = Producer;\n`
            );

            const exit = yield* Effect.exit(runLintCommand(["package-test-imports"]));

            const errorLines = yield* TestConsole.errorLines;
            expectReportedExit(exit);
            expect(errorLines).toContain(
              "packages/foundation/modeling/consumer/dtslint/Consumer.tst.ts:1 ../../producer/src/Producer.ts -> @beep/producer/Producer"
            );
          })
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );

  it(
    "allows relative imports to local test fixtures",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const packageDir = path.join("packages", "foundation", "modeling", "example");

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
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );

  it(
    "allows internal package alias imports",
    () =>
      Effect.runPromise(
        withTempWorkingDirectory(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const packageDir = path.join("packages", "foundation", "modeling", "example");

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
        ).pipe(provideScopedLayer(testLayer))
      ),
    5_000
  );
});
