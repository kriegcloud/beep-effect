import { docgenCommand } from "@beep/repo-cli/commands/Docgen/index";
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
} from "@beep/repo-cli/commands/Docgen/internal/Operations";
import { FsUtilsLive } from "@beep/repo-utils";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, Exit, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = Layer.mergeAll(PlatformLayer, FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)));
const CommandPlatformLayer = Layer.mergeAll(NodeServices.layer);
const CommandTestLayer = Layer.mergeAll(
  CommandPlatformLayer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(CommandPlatformLayer)),
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
        process.exitCode = previousExitCode ?? 0;
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
        process.exitCode = previousExitCode ?? 0;
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
              $schema: "../../../tooling/docgen/schema.json",
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

          expect(config.$schema).toBe("../../../tooling/docgen/schema.json");
          expect(config.exclude).toEqual(["src/internal/**/*.ts"]);
          expect(config.srcLink).toBe(
            "https://github.com/kriegcloud/beep-effect/tree/main/packages/common/identity/src/"
          );
          expect(paths).toEqual({
            noEmit: true,
            strict: true,
            skipLibCheck: true,
            moduleResolution: "bundler",
            module: "es2022",
            target: "es2022",
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
              workspaces: ["packages/common/*", "packages/runtime/*"],
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

          const runtimeDir = path.join(tmpDir, "packages", "runtime", "server");
          yield* fs.makeDirectory(path.join(runtimeDir, "src", "internal"), { recursive: true });
          yield* fs.writeFileString(
            path.join(runtimeDir, "package.json"),
            encodeJson({
              name: "@beep/runtime-server",
              version: "0.0.0",
              dependencies: {
                "@beep/schema": "workspace:*",
              },
              exports: {
                ".": "./src/internal/index.ts",
                "./*": "./src/internal/*.ts",
              },
            })
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/runtime-server");

          expect(target).toBeDefined();

          const config = yield* createDocgenConfigDocument(target!, tmpDir);

          expect(config.examplesCompilerOptions).toMatchObject({
            paths: {
              "@beep/runtime-server": ["../../../packages/runtime/server/src/internal/index.ts"],
              "@beep/runtime-server/*": ["../../../packages/runtime/server/src/internal/*.ts"],
              "@beep/schema": ["../../../packages/common/schema/src/index.ts"],
              "@beep/schema/*": ["../../../packages/common/schema/src/*.ts"],
            },
          });
        })
      )
    );
  });

  it("ignores vendored docgen trees that are outside workspace patterns", async () => {
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

          const workspacePackageDir = path.join(tmpDir, "packages", "common", "schema");
          yield* fs.makeDirectory(path.join(workspacePackageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(workspacePackageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(workspacePackageDir, "docgen.json"), encodeJson({ srcDir: "src" }));

          const vendoredPackageDir = path.join(tmpDir, ".repos", "effect-v4", "packages", "effect");
          yield* fs.makeDirectory(path.join(vendoredPackageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(vendoredPackageDir, "package.json"),
            encodeJson({
              name: "effect",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(vendoredPackageDir, "docgen.json"), encodeJson({ srcDir: "src" }));

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);

          expect(packages.map((pkg) => pkg.relativePath)).toEqual(["packages/common/schema"]);
          expect(packages.map((pkg) => pkg.name)).toEqual(["@beep/schema"]);
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

  it("supports clean aggregation when stale docs paths conflict with nested package docs", async () => {
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

          const packageDir = path.join(tmpDir, "packages", "repo-memory", "store");
          const docsModulesDir = path.join(packageDir, "docs", "modules");
          yield* fs.makeDirectory(docsModulesDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/repo-memory-store",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(
            path.join(docsModulesDir, "Store.md"),
            `---\nparent: Modules\ntitle: Store\n---\n\ncontent\n`
          );

          yield* fs.makeDirectory(path.join(tmpDir, "docs"), { recursive: true });
          yield* fs.writeFileString(path.join(tmpDir, "docs", "repo-memory"), "stale-path-conflict");

          const results = yield* aggregateGeneratedDocs({ clean: true });
          const aggregatedPath = path.join(tmpDir, "docs", "repo-memory", "store", "Store.md");
          const aggregated = yield* fs.readFileString(aggregatedPath);

          expect(results).toHaveLength(1);
          expect(results[0]?.docsOutputPath).toBe("repo-memory/store");
          expect(aggregated).toContain('parent: "@beep/repo-memory-store"');
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

  it("checks docgen metadata without writing analysis files", async () => {
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
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(
            path.join(packageDir, "src", "index.ts"),
            `export const MissingMetadata = "nope";\n`
          );

          yield* runDocgenCommand(["check", "-p", "packages/common/schema"]);

          const errorLines = yield* TestConsole.errorLines;
          const wroteMarkdown = yield* fs.exists(path.join(packageDir, "JSDOC_ANALYSIS.md"));
          const wroteJson = yield* fs.exists(path.join(packageDir, "JSDOC_ANALYSIS.json"));

          expect(errorLines.join("\n")).toContain("packages/common/schema has");
          expect(errorLines.join("\n")).toContain("<module fileoverview> missing @since");
          expect(errorLines.join("\n")).toContain("MissingMetadata missing @since");
          expect(wroteMarkdown).toBe(false);
          expect(wroteJson).toBe(false);
          expect(process.exitCode).toBe(1);
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

  it("accepts --filter for generate and resolves it like --package", async () => {
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

          yield* runDocgenCommand(["generate", "--filter", "packages/common/schema"]);

          const errorLines = yield* TestConsole.errorLines;

          expect(errorLines).toEqual([
            'docgen: packages/common/schema is missing docgen.json. Run "bun run beep docgen init -p packages/common/schema" first.',
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("rejects conflicting selector flags for generate", async () => {
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

          yield* runDocgenCommand(["generate", "--package", "packages/common/schema", "--filter", "@beep/schema"]);

          const errorLines = yield* TestConsole.errorLines;

          expect(errorLines).toEqual([
            "docgen: Received conflicting selectors --package=packages/common/schema and --filter=@beep/schema.",
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("writes lint-clean docgen.json during init", async () => {
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
          const docgenPath = path.join(packageDir, "docgen.json");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
              exports: {
                ".": "./src/index.ts",
                "./*": "./src/*.ts",
              },
            })
          );

          yield* runDocgenCommand(["init", "-p", "packages/common/schema"]);

          const docgenText = yield* fs.readFileString(docgenPath);

          expect(docgenText).toContain('"exclude": ["src/internal/**/*.ts"],');
          expect(docgenText).toContain('"lib": ["ESNext", "DOM", "DOM.Iterable"],');
          expect(docgenText).toContain('"@beep/schema": ["../../../packages/common/schema/src/index.ts"],');
          expect(docgenText).toContain('"@beep/schema/*": ["../../../packages/common/schema/src/*.ts"]');
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });
});
