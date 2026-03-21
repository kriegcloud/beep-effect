import { FsUtilsLive } from "@beep/repo-utils";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";
import { createPackageCommand } from "../src/commands/CreatePackage/index.js";

const CommandPlatformLayer = Layer.mergeAll(NodeServices.layer);
const CommandTestLayer = Layer.mergeAll(
  CommandPlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(CommandPlatformLayer))
);
const runCreatePackageCommand = Command.runWith(createPackageCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const withTempRepoCommand = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();

      process.chdir(tmpDir);
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, previousCwd, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  ).pipe(Effect.provide(CommandTestLayer));

const writeJsonFile = Effect.fn(function* (filePath: string, value: unknown) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString(filePath, `${encodeJson(value)}\n`);
});

describe("create-package docgen template", () => {
  it("scaffolds the canonical starter docgen config", async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rootDir = process.cwd();

          yield* writeJsonFile(path.join(rootDir, "package.json"), {
            name: "@beep/test-root",
            private: true,
            workspaces: ["packages/common/*"],
          });
          yield* writeJsonFile(path.join(rootDir, "tsconfig.json"), {
            compilerOptions: {
              paths: {},
            },
          });
          yield* writeJsonFile(path.join(rootDir, "tsconfig.packages.json"), {
            references: [],
          });
          yield* writeJsonFile(path.join(rootDir, "tstyche.config.json"), {
            testFileMatch: [],
          });

          yield* runCreatePackageCommand(["telemetry", "--parent-dir", "packages/common"]);

          const docgenConfig = JSON.parse(
            yield* fs.readFileString(path.join(rootDir, "packages", "common", "telemetry", "docgen.json"))
          );

          expect(docgenConfig).toEqual({
            $schema: "../../../node_modules/@effect/docgen/schema.json",
            exclude: ["src/internal/**/*.ts"],
            srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/telemetry/src/",
            examplesCompilerOptions: {
              noEmit: true,
              strict: true,
              skipLibCheck: true,
              moduleResolution: "Bundler",
              module: "ES2022",
              target: "ES2022",
              lib: ["ESNext", "DOM", "DOM.Iterable"],
              rewriteRelativeImportExtensions: true,
              allowImportingTsExtensions: true,
              moduleDetection: "force",
              verbatimModuleSyntax: true,
              allowJs: false,
              erasableSyntaxOnly: true,
              declaration: true,
              declarationMap: true,
              sourceMap: true,
              exactOptionalPropertyTypes: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noImplicitOverride: true,
              noFallthroughCasesInSwitch: true,
              stripInternal: false,
              noErrorTruncation: true,
              types: [],
              jsx: "react-jsx",
              paths: {
                "@beep/telemetry": ["../../../packages/common/telemetry/src/index.ts"],
                "@beep/telemetry/*": ["../../../packages/common/telemetry/src/*.ts"],
              },
            },
          });
        })
      )
    );
  });
});
