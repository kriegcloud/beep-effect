import { FsUtilsLive } from "@beep/repo-utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";
import { syncTsconfigAtRoot } from "../src/commands/TsconfigSync.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = Layer.mergeAll(PlatformLayer, FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)));
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const withTempRepo = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();

      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });
      process.chdir(tmpDir);
      return { fs, previousCwd, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  ).pipe(Effect.provide(TestLayer));

const writeJsonFile = Effect.fn(function* (filePath: string, value: unknown) {
  const fs = yield* FileSystem.FileSystem;
  const encoded = encodeJson(value);
  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });
  yield* fs.writeFileString(filePath, `${jsonc.applyEdits(encoded, edits)}\n`);
});

describe("tsconfig-sync docgen", () => {
  it("syncs managed docgen fields, preserves extras, and respects filter", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rootDir = process.cwd();
          yield* writeJsonFile(path.join(rootDir, "package.json"), {
            name: "@beep/test-root",
            private: true,
            workspaces: ["packages/common/*"],
          });
          yield* writeJsonFile(path.join(rootDir, "tsconfig.packages.json"), {
            references: [{ path: "packages/common/identity" }, { path: "packages/common/schema" }],
          });
          yield* writeJsonFile(path.join(rootDir, "tsconfig.json"), {
            compilerOptions: {
              paths: {
                "@beep/identity": ["./packages/common/identity/src/index.ts"],
                "@beep/identity/*": ["./packages/common/identity/src/*"],
                "@beep/schema": ["./packages/common/schema/src/index.ts"],
                "@beep/schema/*": ["./packages/common/schema/src/*"],
              },
            },
          });

          const schemaDir = path.join(rootDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(schemaDir, "src"), { recursive: true });
          yield* writeJsonFile(path.join(schemaDir, "package.json"), {
            name: "@beep/schema",
            version: "0.0.0",
            exports: {
              ".": "./src/index.ts",
              "./*": "./src/*.ts",
            },
          });
          yield* writeJsonFile(path.join(schemaDir, "tsconfig.json"), {
            compilerOptions: {
              outDir: "dist",
              rootDir: "src",
            },
          });
          const schemaDocgenPath = path.join(schemaDir, "docgen.json");
          const schemaDocgenOriginal = `${encodeJson({
            $schema: "../../../node_modules/@effect/docgen/schema.json",
            srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/schema/src/",
          })}\n`;
          yield* fs.writeFileString(schemaDocgenPath, schemaDocgenOriginal);

          const identityDir = path.join(rootDir, "packages", "common", "identity");
          yield* fs.makeDirectory(path.join(identityDir, "src"), { recursive: true });
          yield* writeJsonFile(path.join(identityDir, "package.json"), {
            name: "@beep/identity",
            version: "0.0.0",
            dependencies: {
              "@beep/schema": "workspace:*",
            },
            exports: {
              ".": "./src/index.ts",
              "./*": "./src/*.ts",
            },
          });
          yield* writeJsonFile(path.join(identityDir, "tsconfig.json"), {
            references: [{ path: "../schema/tsconfig.json" }],
            compilerOptions: {
              outDir: "dist",
              rootDir: "src",
            },
          });
          yield* writeJsonFile(path.join(identityDir, "docgen.json"), {
            $schema: "../../../node_modules/@effect/docgen/schema.json",
            exclude: ["src/**/*.spec.ts"],
            enforceDescriptions: true,
            srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/identity/src/",
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
              paths: {
                "@beep/identity": ["../../../packages/common/identity/src/index.ts"],
              },
            },
          });

          const result = yield* syncTsconfigAtRoot(rootDir, {
            mode: "sync",
            filter: "@beep/identity",
            verbose: false,
          });

          expect(result.changes).toHaveLength(1);
          expect(result.changes[0]?.section).toBe("package-docgen");

          const syncedIdentityDocgen = JSON.parse(yield* fs.readFileString(path.join(identityDir, "docgen.json")));
          expect(syncedIdentityDocgen.exclude).toEqual(["src/**/*.spec.ts"]);
          expect(syncedIdentityDocgen.enforceDescriptions).toBe(true);
          expect(syncedIdentityDocgen.examplesCompilerOptions).toMatchObject({
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
              "@beep/identity": ["../../../packages/common/identity/src/index.ts"],
              "@beep/identity/*": ["../../../packages/common/identity/src/*.ts"],
              "@beep/schema": ["../../../packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["../../../packages/common/schema/src/*.ts"],
            },
          });
          expect(syncedIdentityDocgen.examplesCompilerOptions.paths.effect).toBeUndefined();
          expect(yield* fs.readFileString(schemaDocgenPath)).toBe(schemaDocgenOriginal);
        })
      )
    );
  });

  it("reports docgen drift in check mode and backfills missing exclude and compiler options in sync mode", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rootDir = process.cwd();
          yield* writeJsonFile(path.join(rootDir, "package.json"), {
            name: "@beep/test-root",
            private: true,
            workspaces: ["packages/common/*", "packages/runtime/*"],
          });
          yield* writeJsonFile(path.join(rootDir, "tsconfig.packages.json"), {
            references: [{ path: "packages/common/schema" }, { path: "packages/runtime/protocol" }],
          });
          yield* writeJsonFile(path.join(rootDir, "tsconfig.json"), {
            compilerOptions: {
              paths: {
                "@beep/schema": ["./packages/common/schema/src/index.ts"],
                "@beep/schema/*": ["./packages/common/schema/src/*"],
                "@beep/runtime-protocol": ["./packages/runtime/protocol/src/index.ts"],
                "@beep/runtime-protocol/*": ["./packages/runtime/protocol/src/*"],
              },
            },
          });

          const schemaDir = path.join(rootDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(schemaDir, "src"), { recursive: true });
          yield* writeJsonFile(path.join(schemaDir, "package.json"), {
            name: "@beep/schema",
            version: "0.0.0",
            exports: {
              ".": "./src/index.ts",
              "./*": "./src/*.ts",
            },
          });
          yield* writeJsonFile(path.join(schemaDir, "tsconfig.json"), {
            compilerOptions: {
              outDir: "dist",
              rootDir: "src",
            },
          });
          yield* writeJsonFile(path.join(schemaDir, "docgen.json"), {
            $schema: "../../../node_modules/@effect/docgen/schema.json",
            exclude: ["src/internal/**/*.ts"],
            srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/schema/src/",
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
                "@beep/schema": ["../../../packages/common/schema/src/index.ts"],
                "@beep/schema/*": ["../../../packages/common/schema/src/*.ts"],
              },
            },
          });

          const protocolDir = path.join(rootDir, "packages", "runtime", "protocol");
          yield* fs.makeDirectory(path.join(protocolDir, "src"), { recursive: true });
          yield* writeJsonFile(path.join(protocolDir, "package.json"), {
            name: "@beep/runtime-protocol",
            version: "0.0.0",
            dependencies: {
              "@beep/schema": "workspace:*",
            },
            exports: {
              ".": "./src/index.ts",
              "./*": "./src/*.ts",
            },
          });
          yield* writeJsonFile(path.join(protocolDir, "tsconfig.json"), {
            references: [{ path: "../../common/schema/tsconfig.json" }],
            compilerOptions: {
              outDir: "dist",
              rootDir: "src",
            },
          });
          yield* writeJsonFile(path.join(protocolDir, "docgen.json"), {
            $schema: "../../../node_modules/@effect/docgen/schema.json",
            srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/runtime/protocol/src/",
          });

          const drift = yield* syncTsconfigAtRoot(rootDir, {
            mode: "check",
            filter: "@beep/runtime-protocol",
            verbose: false,
          }).pipe(
            Effect.match({
              onFailure: (error) => error,
              onSuccess: () => undefined,
            })
          );

          expect(drift?._tag).toBe("TsconfigSyncDriftError");
          expect(drift?.fileCount).toBe(1);

          const syncResult = yield* syncTsconfigAtRoot(rootDir, {
            mode: "sync",
            filter: "@beep/runtime-protocol",
            verbose: false,
          });

          expect(syncResult.changes).toHaveLength(1);
          expect(syncResult.changes[0]?.section).toBe("package-docgen");

          const syncedProtocolDocgen = JSON.parse(yield* fs.readFileString(path.join(protocolDir, "docgen.json")));
          expect(syncedProtocolDocgen.exclude).toEqual(["src/internal/**/*.ts"]);
          expect(syncedProtocolDocgen.examplesCompilerOptions).toMatchObject({
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
              "@beep/runtime-protocol": ["../../../packages/runtime/protocol/src/index.ts"],
              "@beep/runtime-protocol/*": ["../../../packages/runtime/protocol/src/*.ts"],
              "@beep/schema": ["../../../packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["../../../packages/common/schema/src/*.ts"],
            },
          });
        })
      )
    );
  });
});
