import { syncTsconfigAtRoot } from "@beep/repo-cli/commands/TsconfigSync";
import { FsUtilsLive } from "@beep/repo-utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = Layer.mergeAll(PlatformLayer, FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)));
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const decodeUnknownJson = S.decodeUnknownSync(S.fromJsonString(S.Unknown));

const TsconfigReferences = S.Struct({
  references: S.Array(
    S.Struct({
      path: S.String,
    })
  ),
});
const TsconfigPaths = S.Struct({
  compilerOptions: S.Struct({
    paths: S.Record(S.String, S.Array(S.String)),
  }),
});
const TstycheConfig = S.Struct({
  testFileMatch: S.Array(S.String),
});

const decodeTsconfigReferences = S.decodeUnknownSync(TsconfigReferences);
const decodeTsconfigPaths = S.decodeUnknownSync(TsconfigPaths);
const decodeTstycheConfig = S.decodeUnknownSync(TstycheConfig);

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

const writeTextFile = Effect.fn(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const writeJsonFile = Effect.fn(function* (filePath: string, value: unknown) {
  const encoded = encodeJson(value);
  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });
  yield* writeTextFile(filePath, `${jsonc.applyEdits(encoded, edits)}\n`);
});

const readJsonFile = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return decodeUnknownJson(yield* fs.readFileString(filePath));
});

const readJsoncFile = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return jsonc.parse(yield* fs.readFileString(filePath), undefined, {
    allowTrailingComma: true,
    disallowComments: false,
  });
});

const writeSyncpackConfig = (filePath: string, sources: ReadonlyArray<string>) =>
  writeTextFile(
    filePath,
    `import type { RcFile } from "syncpack";

const config = {
  source: [
${A.join(
  A.map(sources, (source) => `    "${source}",`),
  "\n"
)}
  ],
  customTypes: {},
  versionGroups: [],
} satisfies RcFile;

export default config;
`
  );

const bootstrapRootConfig = Effect.fn(function* (
  rootDir: string,
  options: {
    readonly workspaces: ReadonlyArray<string>;
    readonly references: ReadonlyArray<string>;
    readonly paths: Record<string, ReadonlyArray<string>>;
    readonly testFileMatch: ReadonlyArray<string>;
    readonly syncpackSources: ReadonlyArray<string>;
  }
) {
  const path = yield* Path.Path;

  yield* writeJsonFile(path.join(rootDir, "package.json"), {
    name: "@beep/test-root",
    private: true,
    workspaces: options.workspaces,
  });
  yield* writeJsonFile(path.join(rootDir, "tsconfig.packages.json"), {
    references: A.map(options.references, (referencePath) => ({ path: referencePath })),
  });
  yield* writeJsonFile(path.join(rootDir, "tsconfig.quality.packages.json"), {
    references: A.map(options.references, (referencePath) => ({ path: referencePath })),
  });
  yield* writeJsonFile(path.join(rootDir, "tsconfig.json"), {
    compilerOptions: {
      paths: options.paths,
    },
  });
  yield* writeJsonFile(path.join(rootDir, "tstyche.json"), {
    testFileMatch: options.testFileMatch,
    tsconfig: "findup",
  });
  yield* writeSyncpackConfig(path.join(rootDir, "syncpack.config.ts"), options.syncpackSources);
});

const bootstrapWorkspace = Effect.fn(function* (
  rootDir: string,
  options: {
    readonly relativeDir: string;
    readonly packageName: string;
    readonly dependencies?: Record<string, string>;
    readonly references?: ReadonlyArray<string>;
    readonly docgenConfig?: unknown;
  }
) {
  const path = yield* Path.Path;
  const workspaceDir = path.join(rootDir, options.relativeDir);

  yield* writeJsonFile(path.join(workspaceDir, "package.json"), {
    name: options.packageName,
    version: "0.0.0",
    ...(options.dependencies === undefined ? {} : { dependencies: options.dependencies }),
    exports: {
      ".": "./src/index.ts",
      "./*": "./src/*.ts",
    },
  });
  yield* writeJsonFile(path.join(workspaceDir, "tsconfig.json"), {
    ...(options.references === undefined
      ? {}
      : {
          references: A.map(options.references, (referencePath) => ({ path: referencePath })),
        }),
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
    },
  });
  yield* writeTextFile(
    path.join(workspaceDir, "src", "index.ts"),
    `export const workspaceName = "${options.packageName}";\n`
  );

  if (options.docgenConfig !== undefined) {
    yield* writeJsonFile(path.join(workspaceDir, "docgen.json"), options.docgenConfig);
  }
});

describe("tsconfig-sync", () => {
  it("synchronizes root references, aliases, tstyche, and syncpack from workspace discovery", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rootDir = process.cwd();

          yield* bootstrapRootConfig(rootDir, {
            workspaces: ["packages/common/*", "packages/editor"],
            references: ["packages/common/identity"],
            paths: {
              "@beep/identity": ["./packages/common/identity/src/index.ts"],
              "@beep/identity/*": ["./packages/common/identity/src/*"],
            },
            testFileMatch: [
              "packages/*/dtslint/**/*.tst.*",
              "packages/common/identity/dtslint/**/*.tst.*",
              "packages/editor/dtslint/**/*.tst.*",
            ],
            syncpackSources: ["package.json", "packages/common/*/package.json"],
          });
          yield* bootstrapWorkspace(rootDir, {
            relativeDir: "packages/common/identity",
            packageName: "@beep/identity",
          });
          yield* bootstrapWorkspace(rootDir, {
            relativeDir: "packages/editor",
            packageName: "@beep/editor",
          });

          const result = yield* syncTsconfigAtRoot(rootDir, {
            mode: "sync",
            filter: "@beep/editor",
            verbose: false,
          });

          expect(A.map(result.changes, (change) => change.section)).toEqual([
            "root-syncpack",
            "root-aliases",
            "root-references",
            "root-quality-references",
            "root-tstyche",
          ]);

          const refs = decodeTsconfigReferences(yield* readJsoncFile(path.join(rootDir, "tsconfig.packages.json")));
          expect(A.map(refs.references, (entry) => entry.path)).toEqual([
            "packages/common/identity",
            "packages/editor",
          ]);

          const qualityRefs = decodeTsconfigReferences(
            yield* readJsoncFile(path.join(rootDir, "tsconfig.quality.packages.json"))
          );
          expect(A.map(qualityRefs.references, (entry) => entry.path)).toEqual([
            "packages/common/identity",
            "packages/editor",
          ]);

          const paths = decodeTsconfigPaths(yield* readJsoncFile(path.join(rootDir, "tsconfig.json")));
          expect(paths.compilerOptions.paths).toMatchObject({
            "@beep/identity": ["./packages/common/identity/src/index.ts"],
            "@beep/identity/*": ["./packages/common/identity/src/*"],
            "@beep/editor": ["./packages/editor/src/index.ts"],
            "@beep/editor/*": ["./packages/editor/src/*"],
          });

          const tstycheConfig = decodeTstycheConfig(yield* readJsonFile(path.join(rootDir, "tstyche.json")));
          expect(tstycheConfig.testFileMatch).toEqual([
            "packages/*/dtslint/**/*.tst.*",
            "packages/common/identity/dtslint/**/*.tst.*",
          ]);

          const syncpackConfig = yield* fs.readFileString(path.join(rootDir, "syncpack.config.ts"));
          expect(syncpackConfig).toContain(`"packages/editor/package.json"`);
        })
      )
    );
  });

  it("syncs managed docgen fields, preserves extras, and respects filter", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const rootDir = process.cwd();

          yield* bootstrapRootConfig(rootDir, {
            workspaces: ["packages/common/*"],
            references: ["packages/common/identity", "packages/common/schema"],
            paths: {
              "@beep/identity": ["./packages/common/identity/src/index.ts"],
              "@beep/identity/*": ["./packages/common/identity/src/*"],
              "@beep/schema": ["./packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["./packages/common/schema/src/*"],
            },
            testFileMatch: [
              "packages/*/dtslint/**/*.tst.*",
              "packages/common/identity/dtslint/**/*.tst.*",
              "packages/common/schema/dtslint/**/*.tst.*",
            ],
            syncpackSources: ["package.json", "packages/common/*/package.json"],
          });

          yield* bootstrapWorkspace(rootDir, {
            relativeDir: "packages/common/schema",
            packageName: "@beep/schema",
            docgenConfig: {
              $schema: "../../../node_modules/@effect/docgen/schema.json",
              srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/schema/src/",
            },
          });
          yield* bootstrapWorkspace(rootDir, {
            relativeDir: "packages/common/identity",
            packageName: "@beep/identity",
            dependencies: {
              "@beep/schema": "workspace:*",
            },
            references: ["../schema/tsconfig.json"],
            docgenConfig: {
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
            },
          });

          const result = yield* syncTsconfigAtRoot(rootDir, {
            mode: "sync",
            filter: "@beep/identity",
            verbose: false,
          });

          expect(result.changes).toHaveLength(1);
          expect(result.changes[0]?.section).toBe("package-docgen");

          const syncedIdentityDocgen = yield* readJsonFile(
            path.join(rootDir, "packages", "common", "identity", "docgen.json")
          );
          expect(syncedIdentityDocgen).toMatchObject({
            exclude: ["src/**/*.spec.ts"],
            enforceDescriptions: true,
            examplesCompilerOptions: {
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
            },
          });
        })
      )
    );
  });

  it("reports docgen drift in check mode and backfills missing managed fields in sync mode", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const rootDir = process.cwd();

          yield* bootstrapRootConfig(rootDir, {
            workspaces: ["packages/common/*", "packages/runtime/*"],
            references: ["packages/common/schema", "packages/runtime/protocol"],
            paths: {
              "@beep/schema": ["./packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["./packages/common/schema/src/*"],
              "@beep/runtime-protocol": ["./packages/runtime/protocol/src/index.ts"],
              "@beep/runtime-protocol/*": ["./packages/runtime/protocol/src/*"],
            },
            testFileMatch: [
              "packages/*/dtslint/**/*.tst.*",
              "packages/common/schema/dtslint/**/*.tst.*",
              "packages/runtime/protocol/dtslint/**/*.tst.*",
            ],
            syncpackSources: ["package.json", "packages/common/*/package.json", "packages/runtime/*/package.json"],
          });

          yield* bootstrapWorkspace(rootDir, {
            relativeDir: "packages/common/schema",
            packageName: "@beep/schema",
            docgenConfig: {
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
            },
          });
          yield* bootstrapWorkspace(rootDir, {
            relativeDir: "packages/runtime/protocol",
            packageName: "@beep/runtime-protocol",
            dependencies: {
              "@beep/schema": "workspace:*",
            },
            references: ["../../common/schema/tsconfig.json"],
            docgenConfig: {
              $schema: "../../../node_modules/@effect/docgen/schema.json",
              srcLink: "https://github.com/kriegcloud/beep-effect/tree/main/packages/runtime/protocol/src/",
            },
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
          if (drift?._tag !== "TsconfigSyncDriftError") {
            return;
          }
          expect(drift.fileCount).toBe(1);

          const syncResult = yield* syncTsconfigAtRoot(rootDir, {
            mode: "sync",
            filter: "@beep/runtime-protocol",
            verbose: false,
          });

          expect(syncResult.changes).toHaveLength(1);
          expect(syncResult.changes[0]?.section).toBe("package-docgen");

          const syncedProtocolDocgen = yield* readJsonFile(
            path.join(rootDir, "packages", "runtime", "protocol", "docgen.json")
          );
          expect(syncedProtocolDocgen).toMatchObject({
            exclude: ["src/internal/**/*.ts"],
            examplesCompilerOptions: {
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
            },
          });
        })
      )
    );
  });
});
