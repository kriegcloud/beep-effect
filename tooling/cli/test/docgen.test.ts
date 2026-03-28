import { FsUtilsLive } from "@beep/repo-utils";
import { NodeServices } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, Exit, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";
import { docgenCommand } from "../src/commands/Docgen/index.js";
import {
  aggregateGeneratedDocs,
  analyzePackageDocumentation,
  createDocgenConfigDocument,
  DocgenAnalysisSummary,
  DocgenExportAnalysis,
  DocgenPackageAnalysis,
  discoverDocgenWorkspacePackages,
  generateAnalysisReport,
  loadDocgenConfigDocument,
} from "../src/commands/Docgen/internal/Operations.js";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = Layer.mergeAll(PlatformLayer, FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)));
const CommandPlatformLayer = Layer.mergeAll(NodeServices.layer);
const CommandTestLayer = Layer.mergeAll(
  CommandPlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(CommandPlatformLayer)),
  TestConsole.layer
);
const runDocgenCommand = Command.runWith(docgenCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const withTempRepo = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousExitCode = process.exitCode;

      process.chdir(tmpDir);
      process.exitCode = undefined;
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, path, previousCwd, previousExitCode, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, previousExitCode, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        process.exitCode = previousExitCode;
        yield* fs.remove(tmpDir, { recursive: true });
      })
  ).pipe(Effect.provide(TestLayer));

const withTempRepoCommand = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousExitCode = process.exitCode;

      process.chdir(tmpDir);
      process.exitCode = undefined;
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, previousCwd, previousExitCode, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, previousExitCode, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        process.exitCode = previousExitCode;
        yield* fs.remove(tmpDir, { recursive: true });
      })
  ).pipe(Effect.provide(CommandTestLayer));

describe("Docgen operations", () => {
  it("parses current schema flags and classifies a configured package that has not generated docs", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(
            path.join(packageDir, "docgen.json"),
            encodeJson({
              $schema: "../../../node_modules/@effect/docgen/schema.json",
              enforceDescriptions: true,
              enforceExamples: true,
              enforceVersion: true,
              srcDir: "src",
            })
          );

          const config = yield* loadDocgenConfigDocument(packageDir);
          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(config.enforceDescriptions).toBe(true);
          expect(config.enforceExamples).toBe(true);
          expect(config.enforceVersion).toBe(true);
          expect(target?.status).toBe("configured-not-generated");
          expect(target?.docsOutputPath).toBe("common/schema");
        })
      )
    );
  });

  it("builds repo-standard init config with own and dependency path mappings", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/*/*"],
            })
          );

          const schemaDir = path.join(tmpDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(schemaDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(schemaDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
              exports: {
                ".": "./src/index.ts",
                "./*": "./src/*.ts",
              },
            })
          );

          const identityDir = path.join(tmpDir, "packages", "common", "identity");
          yield* fs.makeDirectory(path.join(identityDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(identityDir, "package.json"),
            encodeJson({
              name: "@beep/identity",
              version: "0.0.0",
              dependencies: {
                "@beep/schema": "workspace:*",
              },
              exports: {
                ".": "./src/index.ts",
                "./*": "./src/*.ts",
              },
            })
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/identity");

          expect(target).toBeDefined();

          const config = yield* createDocgenConfigDocument(target!, tmpDir);
          const paths = config.examplesCompilerOptions;

          expect(config.$schema).toBe("../../../node_modules/@effect/docgen/schema.json");
          expect(config.exclude).toEqual(["src/internal/**/*.ts"]);
          expect(config.srcLink).toBe(
            "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/identity/src/"
          );
          expect(paths).toEqual({
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
              "@beep/identity": ["../../../packages/common/identity/src/index.ts"],
              "@beep/identity/*": ["../../../packages/common/identity/src/*.ts"],
              "@beep/schema": ["../../../packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["../../../packages/common/schema/src/*.ts"],
            },
          });
        })
      )
    );
  });

  it("builds docgen path mappings from non-standard source exports", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/ai/*", "packages/common/*"],
            })
          );

          const schemaDir = path.join(tmpDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(schemaDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(schemaDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
              exports: {
                ".": "./src/index.ts",
                "./*": "./src/*.ts",
              },
            })
          );

          const sdkDir = path.join(tmpDir, "packages", "ai", "sdk");
          yield* fs.makeDirectory(path.join(sdkDir, "src", "claude"), { recursive: true });
          yield* fs.writeFileString(
            path.join(sdkDir, "package.json"),
            encodeJson({
              name: "@beep/ai-sdk",
              version: "0.0.0",
              dependencies: {
                "@beep/schema": "workspace:*",
              },
              exports: {
                ".": "./src/claude/index.ts",
                "./*": "./src/claude/*.ts",
              },
            })
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/ai-sdk");

          expect(target).toBeDefined();

          const config = yield* createDocgenConfigDocument(target!, tmpDir);

          expect(config.examplesCompilerOptions).toMatchObject({
            paths: {
              "@beep/ai-sdk": ["../../../packages/ai/sdk/src/claude/index.ts"],
              "@beep/ai-sdk/*": ["../../../packages/ai/sdk/src/claude/*.ts"],
              "@beep/schema": ["../../../packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["../../../packages/common/schema/src/*.ts"],
            },
          });
        })
      )
    );
  });

  it("preserves the nested docs layout and rewrites module parents", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "common", "schema");
          const docsModulesDir = path.join(packageDir, "docs", "modules");
          yield* fs.makeDirectory(docsModulesDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(
            path.join(docsModulesDir, "Schema.md"),
            `---\nparent: Modules\ntitle: Schema\n---\n\ncontent\n`
          );

          const results = yield* aggregateGeneratedDocs();
          const aggregatedPath = path.join(tmpDir, "docs", "common", "schema", "Schema.md");
          const aggregatedIndexPath = path.join(tmpDir, "docs", "common", "schema", "index.md");
          const aggregated = yield* fs.readFileString(aggregatedPath);
          const aggregatedIndex = yield* fs.readFileString(aggregatedIndexPath);

          expect(results).toHaveLength(1);
          expect(results[0]?.docsOutputPath).toBe("common/schema");
          expect(aggregated).toContain('parent: "@beep/schema"');
          expect(aggregatedIndex).toContain("permalink: /docs/common/schema");
        })
      )
    );
  });

  it("renders human-first report content without agent instructions", () => {
    const analysis = new DocgenPackageAnalysis({
      packageName: "@beep/schema",
      packagePath: "packages/common/schema",
      timestamp: "2026-03-08T00:00:00.000Z",
      exports: [
        new DocgenExportAnalysis({
          name: "Schema",
          kind: "class",
          filePath: "src/index.ts",
          line: 12,
          presentTags: ["@category"],
          missingTags: ["@example", "@since"],
          hasJsDoc: true,
          priority: "medium",
          declarationSource: "export class Schema {}",
          context: "Primary schema export.",
        }),
      ],
      summary: new DocgenAnalysisSummary({
        totalExports: 1,
        fullyDocumented: 0,
        missingDocumentation: 1,
        missingCategory: 0,
        missingExample: 1,
        missingSince: 1,
      }),
    });

    const report = generateAnalysisReport(analysis, true);

    expect(report).toContain("# JSDoc Analysis Report: @beep/schema");
    expect(report).toContain("bun run beep docgen analyze -p packages/common/schema");
    expect(report).toContain("## Fix Checklist");
    expect(report).not.toContain("Instructions for Agent");
    expect(report).not.toContain("You are tasked");
  });

  it("fails analysis when a package-local docgen.json is malformed", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), "{ invalid");

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const exit = yield* analyzePackageDocumentation(target!).pipe(Effect.exit);

          expect(Exit.isFailure(exit)).toBe(true);
        })
      )
    );
  });

  it("returns a non-zero exit code when generate targets an unconfigured package", async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );

          yield* runDocgenCommand(["generate", "-p", "packages/common/schema"]);

          const errorLines = yield* TestConsole.errorLines;

          expect(errorLines).toEqual([
            'docgen: packages/common/schema is missing docgen.json. Run "bun run beep docgen init -p packages/common/schema" first.',
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });
});
