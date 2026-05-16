import { docgenCommand } from "@beep/repo-cli/commands/Docgen/index";
import {
  aggregateGeneratedDocs,
  analyzePackageDocumentation,
  createDocgenConfigDocument,
  DocgenAnalysisSummary,
  DocgenExportAnalysis,
  DocgenPackageAnalysis,
  discoverDocgenWorkspacePackages,
  discoverOrphanDocgenConfigPaths,
  generateAnalysisReport,
  loadDocgenConfigDocument,
} from "@beep/repo-cli/commands/Docgen/internal/Operations";
import {
  analyzeDocgenQuality,
  analyzePackageQuality,
  generateQualityJson,
  generateQualityReport,
} from "@beep/repo-cli/commands/Docgen/internal/Quality";
import {
  analyzeDocgenQualityWorkerEval,
  DocgenQualityWorkerEvalReport,
  type DocgenQualityWorkerEvalRunner,
  generateQualityWorkerEvalJson,
} from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerEval";
import {
  makeQualityWorkerRunpodEvalPodCreateInput,
  requiredQualityWorkerRunpodEvalModel,
  selectQualityWorkerRunpodTemplate,
} from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerRunpodEval";
import { FsUtilsLive, TSMorphServiceLive } from "@beep/repo-utils";
import { Template } from "@beep/runpod";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Duration, Effect, Exit, FileSystem, Layer, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { ChildProcess } from "effect/unstable/process";
import { describe, expect, it } from "vitest";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = Layer.mergeAll(
  PlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer))
);
const CommandPlatformLayer = Layer.mergeAll(NodeServices.layer);
const CommandTestLayer = Layer.mergeAll(
  CommandPlatformLayer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(CommandPlatformLayer)),
  FsUtilsLive.pipe(Layer.provideMerge(CommandPlatformLayer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(CommandPlatformLayer)),
  TestConsole.layer
);
const runDocgenCommand = Command.runWith(docgenCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const decodeUnknownJson = S.decodeUnknownSync(S.fromJsonString(S.Unknown));
const decodeWorkerEvalReportJson = S.decodeUnknownSync(S.fromJsonString(DocgenQualityWorkerEvalReport));
const DOCGEN_COMMAND_TEST_TIMEOUT = 30_000;

const runCommand = (command: string, args: ReadonlyArray<string>, cwd: string) =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(command, [...args], {
        cwd,
        stdout: "ignore",
        stderr: "ignore",
      });
      const exitCode = yield* handle.exitCode;
      expect(exitCode).toBe(0);
    })
  );

const withTempRepo = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousExitCode = process.exitCode;

      process.chdir(tmpDir);
      process.exitCode = 0;
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
      process.exitCode = 0;
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
              $schema: "../../../../packages/tooling/tool/docgen/schema.json",
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
          expect(target?.docsOutputPath).toBe("foundation/modeling/schema");
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const schemaDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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

          const identityDir = path.join(tmpDir, "packages", "foundation", "modeling", "identity");
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

          expect(config.$schema).toBe("../../../../packages/tooling/tool/docgen/schema.json");
          expect(config.exclude).toEqual(["src/internal/**/*.ts"]);
          expect(config.srcLink).toBe(
            "https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/"
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
              "@beep/identity": ["../../../../packages/foundation/modeling/identity/src/index.ts"],
              "@beep/identity/*": ["../../../../packages/foundation/modeling/identity/src/*.ts"],
              "@beep/schema": ["../../../../packages/foundation/modeling/schema/src/index.ts"],
              "@beep/schema/*": ["../../../../packages/foundation/modeling/schema/src/*.ts"],
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
              workspaces: ["packages/foundation/*/*", "packages/example/*"],
            })
          );

          const schemaDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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

          const runtimeDir = path.join(tmpDir, "packages", "example", "server");
          yield* fs.makeDirectory(path.join(runtimeDir, "src", "internal"), { recursive: true });
          yield* fs.writeFileString(
            path.join(runtimeDir, "package.json"),
            encodeJson({
              name: "@beep/example-server",
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
          const target = packages.find((pkg) => pkg.name === "@beep/example-server");

          expect(target).toBeDefined();

          const config = yield* createDocgenConfigDocument(target!, tmpDir);

          expect(config.examplesCompilerOptions).toMatchObject({
            paths: {
              "@beep/example-server": ["../../../packages/example/server/src/internal/index.ts"],
              "@beep/example-server/*": ["../../../packages/example/server/src/internal/*.ts"],
              "@beep/schema": ["../../../packages/foundation/modeling/schema/src/index.ts"],
              "@beep/schema/*": ["../../../packages/foundation/modeling/schema/src/*.ts"],
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const workspacePackageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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

          expect(packages.map((pkg) => pkg.relativePath)).toEqual(["packages/foundation/modeling/schema"]);
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
          const aggregatedPath = path.join(tmpDir, "docs", "foundation", "modeling", "schema", "Schema.md");
          const aggregatedIndexPath = path.join(tmpDir, "docs", "foundation", "modeling", "schema", "index.md");
          const aggregated = yield* fs.readFileString(aggregatedPath);
          const aggregatedIndex = yield* fs.readFileString(aggregatedIndexPath);

          expect(results).toHaveLength(1);
          expect(results[0]?.docsOutputPath).toBe("foundation/modeling/schema");
          expect(aggregated).toContain('parent: "@beep/schema"');
          expect(aggregatedIndex).toContain("permalink: /docs/foundation/modeling/schema");
        })
      )
    );
  });

  it("skips symlinked docs entries during aggregation", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          const docsModulesDir = path.join(packageDir, "docs", "modules");
          const outsideFilePath = path.join(tmpDir, "outside.md");
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
          yield* fs.writeFileString(outsideFilePath, "top-secret\n");
          yield* fs.symlink(outsideFilePath, path.join(docsModulesDir, "Leak.md"));

          const results = yield* aggregateGeneratedDocs();
          const aggregatedPath = path.join(tmpDir, "docs", "foundation", "modeling", "schema", "Schema.md");
          const leakedPath = path.join(tmpDir, "docs", "foundation", "modeling", "schema", "Leak.md");
          const aggregated = yield* fs.readFileString(aggregatedPath);
          const leakedExists = yield* fs.exists(leakedPath);

          expect(results).toHaveLength(1);
          expect(results[0]?.fileCount).toBe(1);
          expect(aggregated).toContain('parent: "@beep/schema"');
          expect(leakedExists).toBe(false);
        })
      )
    );
  });

  it("rejects symlinked docs roots during aggregation", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          const packageDocsDir = path.join(packageDir, "docs");
          const docsModulesDir = path.join(packageDocsDir, "modules");
          const externalDocsModulesDir = path.join(tmpDir, "external-docs", "modules");
          yield* fs.makeDirectory(packageDocsDir, { recursive: true });
          yield* fs.makeDirectory(externalDocsModulesDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(
            path.join(externalDocsModulesDir, "Schema.md"),
            `---\nparent: Modules\ntitle: Schema\n---\n\ncontent\n`
          );
          yield* fs.symlink(externalDocsModulesDir, docsModulesDir);

          const exit = yield* aggregateGeneratedDocs().pipe(Effect.exit);
          const aggregatedPath = path.join(tmpDir, "docs", "foundation", "modeling", "schema");
          const aggregatedExists = yield* fs.exists(aggregatedPath);

          expect(Exit.isFailure(exit)).toBe(true);
          expect(aggregatedExists).toBe(false);
        })
      )
    );
  });

  it("rejects stale docgen configs outside current workspaces during aggregation", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );

          const staleDocgenPath = path.join(tmpDir, "packages", "retired", "runtime", "docgen.json");
          yield* fs.makeDirectory(path.dirname(staleDocgenPath), { recursive: true });
          yield* fs.writeFileString(staleDocgenPath, encodeJson({ srcDir: "src" }));

          const orphaned = yield* discoverOrphanDocgenConfigPaths(tmpDir);
          const error = yield* aggregateGeneratedDocs().pipe(Effect.flip);

          expect(orphaned).toEqual(["packages/retired/runtime/docgen.json"]);
          expect(error.message).toContain("packages/retired/runtime/docgen.json");
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
              workspaces: ["packages/example/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "example", "store");
          const docsModulesDir = path.join(packageDir, "docs", "modules");
          yield* fs.makeDirectory(docsModulesDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/example-store",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(
            path.join(docsModulesDir, "Store.md"),
            `---\nparent: Modules\ntitle: Store\n---\n\ncontent\n`
          );

          yield* fs.makeDirectory(path.join(tmpDir, "docs"), { recursive: true });
          yield* fs.writeFileString(path.join(tmpDir, "docs", "example"), "stale-path-conflict");

          const results = yield* aggregateGeneratedDocs({ clean: true });
          const aggregatedPath = path.join(tmpDir, "docs", "example", "store", "Store.md");
          const aggregated = yield* fs.readFileString(aggregatedPath);

          expect(results).toHaveLength(1);
          expect(results[0]?.docsOutputPath).toBe("example/store");
          expect(aggregated).toContain('parent: "@beep/example-store"');
        })
      )
    );
  });

  it("renders human-first report content without agent instructions", () => {
    const analysis = new DocgenPackageAnalysis({
      packageName: "@beep/schema",
      packagePath: "packages/foundation/modeling/schema",
      timestamp: "2026-03-08T00:00:00.000Z",
      exports: [
        new DocgenExportAnalysis({
          name: "Schema",
          kind: "class",
          filePath: "src/index.ts",
          line: 12,
          presentTags: ["@category"],
          missingTags: ["@example", "@since"],
          categoryValues: ["schemas"],
          categoryIssues: [],
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
        invalidCategory: 0,
        missingExample: 1,
        missingSince: 1,
      }),
    });

    const report = generateAnalysisReport(analysis, true);

    expect(report).toContain("# JSDoc Analysis Report: @beep/schema");
    expect(report).toContain("bun run beep docgen analyze -p packages/foundation/modeling/schema");
    expect(report).toContain("## Fix Checklist");
    expect(report).not.toContain("Instructions for Agent");
    expect(report).not.toContain("You are tasked");
  });

  it("builds rich JSDoc quality subjects and advisory findings", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );
          yield* fs.writeFileString(
            path.join(tmpDir, "tsconfig.json"),
            encodeJson({
              compilerOptions: {
                module: "es2022",
                target: "es2022",
                moduleResolution: "bundler",
                strict: true,
                noEmit: true,
              },
              include: ["packages/**/*.ts"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Package docs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { parseValue } from "@beep/schema"
 * const result = parseValue(" hello ")
 * void result
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const subject = report.subjects.find((entry) => entry.exportName === "parseValue");
          const review = report.reviews.find((entry) => entry.subjectId === subject?.stableIdentity);

          expect(subject?.description).toContain("Parses a value");
          expect(subject?.parsedExamples).toHaveLength(1);
          expect(subject?.sourceAnchor).toContain("packages/foundation/modeling/schema/src/index.ts:");
          expect(subject?.contentHash).toMatch(/^[a-f0-9]{64}$/);
          expect(subject?.declarationKind).toBe("const");
          expect(review?.tier).toBe("warn");
          expect(review?.findings.map((finding) => finding.code)).toContain("example-only-voids-result");
        })
      )
    );
  });

  it("collects local export-list symbols and treats lowercase console output as observable", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `const parseValue = (value: string): string => value.trim();

/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { parseValue } from "@beep/schema"
 * const result = parseValue(" hello ")
 * console.log(result)
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export { parseValue };
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const exportNames = report.subjects.map((subject) => subject.exportName);
          const subject = report.subjects.find((entry) => entry.exportName === "parseValue");
          const review = report.reviews.find((entry) => entry.subjectId === subject?.stableIdentity);
          const findingCodes = review?.findings.map((finding) => finding.code) ?? [];

          expect(exportNames).toEqual(["parseValue"]);
          expect(subject?.description).toContain("Parses a value");
          expect(subject?.rawJsDoc).toContain("@example");
          expect(subject?.stableIdentity).toMatch(
            /^@beep\/schema:packages\/foundation\/modeling\/schema\/src\/index\.ts:const:parseValue:[a-f0-9]{12}$/
          );
          expect(subject?.sourceAnchor).toContain("packages/foundation/modeling/schema/src/index.ts:");
          expect(findingCodes).not.toContain("missing-example");
          expect(findingCodes).not.toContain("example-lacks-observable-result");
          expect(findingCodes).not.toContain("example-only-voids-result");
          expect(findingCodes).not.toContain("example-too-trivial");
          expect(review?.tier).toBe("pass");
        })
      )
    );
  });

  it("aligns observable example and Effect signature heuristics", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { Equal } from "effect"
 * import { parseValue } from "@beep/schema"
 * const result = parseValue(" hello ")
 * void result
 * Equal.equals(result, "hello")
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();

/**
 * Formats a value while mentioning Effect.Exit only in documentation prose.
 *
 * @returns Text for displaying an Effect.Exit label.
 * @example
 * \`\`\`ts
 * import { formatValue } from "@beep/schema"
 * const result = formatValue("hello")
 * console.log(result)
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const formatValue = (value: string): string => \`value: \${value}\`;
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const reviewFor = (exportName: string) => {
            const subject = report.subjects.find((entry) => entry.exportName === exportName);
            return report.reviews.find((entry) => entry.subjectId === subject?.stableIdentity);
          };

          const parseFindingCodes = reviewFor("parseValue")?.findings.map((finding) => finding.code) ?? [];
          const formatFindingCodes = reviewFor("formatValue")?.findings.map((finding) => finding.code) ?? [];

          expect(parseFindingCodes).not.toContain("example-only-voids-result");
          expect(parseFindingCodes).not.toContain("example-lacks-observable-result");
          expect(formatFindingCodes).not.toContain("missing-effects-for-effectful-symbol");
        })
      )
    );
  });

  it("accepts type-level evidence as a useful type-only example", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Extracts the element type from an array or tuple.
 *
 * @example
 * \`\`\`ts
 * import type { Elem } from "@beep/schema"
 *
 * type TupleElement = Elem<readonly [1, 2, 3]>
 * // 1 | 2 | 3
 *
 * declare const element: TupleElement
 * void element
 * \`\`\`
 * @category type-level
 * @since 0.0.0
 */
export type Elem<T> = T extends readonly (infer U)[] ? U : never;
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const subject = report.subjects.find((entry) => entry.exportName === "Elem");
          const review = report.reviews.find((entry) => entry.subjectId === subject?.stableIdentity);
          const findingCodes = review?.findings.map((finding) => finding.code) ?? [];

          expect(subject?.declarationKind).toBe("type");
          expect(findingCodes).not.toContain("example-only-voids-result");
          expect(findingCodes).not.toContain("example-lacks-observable-result");
          expect(review?.tier).toBe("pass");
        })
      )
    );
  });

  it("preserves default-export subjects in quality analysis", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            path.join(packageDir, "src", "DefaultFunction.ts"),
            `/**
 * Normalizes a default-exported function value.
 *
 * @example
 * \`\`\`ts
 * import normalizeDefault from "@beep/schema/DefaultFunction"
 *
 * console.log(normalizeDefault(" hello "))
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export default function (value: string): string {
  return value.trim();
}
`
          );
          yield* fs.writeFileString(
            path.join(packageDir, "src", "DefaultClass.ts"),
            `/**
 * Default-exported value holder fixture.
 *
 * @example
 * \`\`\`ts
 * import DefaultValueHolder from "@beep/schema/DefaultClass"
 *
 * console.log(new DefaultValueHolder().value)
 * \`\`\`
 * @category models
 * @since 0.0.0
 */
export default class {
  readonly value = "class-default";
}
`
          );
          yield* fs.writeFileString(
            path.join(packageDir, "src", "AssignedDefault.ts"),
            `/**
 * Trims a value before exporting it as the module default.
 *
 * @example
 * \`\`\`ts
 * import trimDefault from "@beep/schema/AssignedDefault"
 *
 * console.log(trimDefault(" hello "))
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
const trimDefault = (value: string): string => value.trim();

export default trimDefault;
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const defaultSubjects = pipe(
            report.subjects,
            A.filter((subject) => subject.exportName === "default")
          );

          expect(defaultSubjects).toHaveLength(3);
          expect(
            pipe(
              defaultSubjects,
              A.map((subject) => subject.declarationKind)
            )
          ).toEqual(expect.arrayContaining(["class", "const", "function"]));
          expect(
            pipe(
              defaultSubjects,
              A.map((subject) => subject.repoPath)
            )
          ).toEqual(
            expect.arrayContaining([
              "packages/foundation/modeling/schema/src/AssignedDefault.ts",
              "packages/foundation/modeling/schema/src/DefaultClass.ts",
              "packages/foundation/modeling/schema/src/DefaultFunction.ts",
            ])
          );
        })
      )
    );
  });

  it("treats module re-exports as graph edges instead of quality subjects", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            path.join(packageDir, "src", "Value.ts"),
            `/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { parseValue } from "@beep/schema/Value"
 * const result = parseValue(" hello ")
 * console.log(result)
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );
          yield* fs.writeFileString(
            path.join(packageDir, "src", "index.ts"),
            `/**
 * @since 0.0.0
 * @category parsing
 */
export * as Value from "./Value.ts";
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const exportNames = report.subjects.map((subject) => subject.exportName);
          const findingCodes = pipe(
            report.reviews,
            A.flatMap((review) => A.map(review.findings, (finding) => finding.code))
          );

          expect(exportNames).toEqual(["parseValue"]);
          expect(exportNames).not.toContain("export * as Value");
          expect(findingCodes).not.toContain("missing-example");
          expect(findingCodes).not.toContain("missing-description");
        })
      )
    );
  });

  it("emits schema v2 partial package reports when the package budget is exhausted", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );
          yield* fs.writeFileString(path.join(packageDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(path.join(packageDir, "src", "index.ts"), `export const parseValue = "skip";\n`);

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzeDocgenQuality({
            packageTimeout: Duration.millis(0),
            scope: "package",
            scoreMode: "rubric",
            targets: [target!],
          });
          const json = yield* generateQualityJson(report);
          const decoded = decodeUnknownJson(json) as {
            readonly schemaVersion?: unknown;
            readonly packages?: ReadonlyArray<{
              readonly durationMs?: unknown;
              readonly error?: unknown;
              readonly status?: unknown;
              readonly timedOut?: unknown;
            }>;
          };

          expect(decoded.schemaVersion).toBe(2);
          expect(decoded.packages?.[0]?.status).toBe("partial");
          expect(decoded.packages?.[0]?.timedOut).toBe(true);
          expect(decoded.packages?.[0]?.durationMs).toEqual(expect.any(Number));
          expect(decoded.packages?.[0]?.error).toContain("Timed out");
        })
      )
    );
  });

  it("honors docgen exclude globs during quality subject collection", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src", "internal"), { recursive: true });
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
              srcDir: "src",
              exclude: ["src/internal/**/*.ts", "src/*.generated.ts"],
            })
          );
          yield* fs.writeFileString(
            path.join(packageDir, "src", "index.ts"),
            `/**
 * Package docs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { parseValue } from "@beep/schema"
 * const result = parseValue(" hello ")
 * expect(result).toBe("hello")
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );
          yield* fs.writeFileString(
            path.join(packageDir, "src", "internal", "Hidden.ts"),
            `export const HiddenInternal = "skip me";\n`
          );
          yield* fs.writeFileString(
            path.join(packageDir, "src", "schema.generated.ts"),
            `export const GeneratedExport = "skip me too";\n`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzePackageQuality(target!);
          const exportNames = report.subjects.map((subject) => subject.exportName);

          expect(exportNames).toContain("parseValue");
          expect(exportNames).not.toContain("HiddenInternal");
          expect(exportNames).not.toContain("GeneratedExport");
        })
      )
    );
  });

  it("selects packages from changed-files git output", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          yield* runCommand("git", ["init"], tmpDir);
          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { parseValue } from "@beep/schema"
 * const result = parseValue(" hello ")
 * console.log(result)
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );

          yield* runDocgenCommand(["quality", "--changed-files", "--json"]);

          const output = (yield* TestConsole.logLines).join("\n");
          const decoded = decodeUnknownJson(output) as {
            readonly scope?: string;
            readonly packages?: ReadonlyArray<{
              readonly packageName?: string;
              readonly subjects?: ReadonlyArray<{ readonly exportName?: string }>;
            }>;
          };

          expect(decoded.scope).toBe("changed-files");
          expect(decoded.packages?.[0]?.packageName).toBe("@beep/schema");
          expect(decoded.packages?.[0]?.subjects?.map((subject) => subject.exportName)).toContain("parseValue");
        })
      )
    );
  });

  it("renders consolidated quality reports and Codex remediation packets", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );
          yield* fs.writeFileString(
            path.join(tmpDir, "tsconfig.json"),
            encodeJson({
              compilerOptions: {
                module: "es2022",
                target: "es2022",
                moduleResolution: "bundler",
                strict: true,
                noEmit: true,
              },
              include: ["packages/**/*.ts"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Missing example fixture.
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const report = yield* analyzeDocgenQuality({
            scope: "package",
            scoreMode: "codex",
            targets: [target!],
          });
          const deterministicReport = yield* analyzeDocgenQuality({
            scope: "package",
            scoreMode: "none",
            targets: [target!],
          });
          const markdown = generateQualityReport(report);
          const json = yield* generateQualityJson(report);
          const decoded = decodeUnknownJson(json) as Record<string, unknown>;

          expect(report.scorer).toBe("codex-advisory-packet-v1");
          expect(report.summary.failures).toBeGreaterThan(0);
          expect(report.packages[0]?.summary.remediationPackets).toBeGreaterThan(0);
          expect(report.remediationPackets[0]?.prompt).toContain("Keep @example mandatory");
          expect(report.remediationPackets[0]?.verificationArgv).toEqual([
            "bun",
            "run",
            "beep",
            "docgen",
            "quality",
            "-p",
            "packages/foundation/modeling/schema",
            "--json",
          ]);
          expect(deterministicReport.scorer).toBe("deterministic-rubric-v1");
          expect(deterministicReport.summary.remediationPackets).toBe(0);
          expect(deterministicReport.remediationPackets).toHaveLength(0);
          expect(markdown).toContain("# JSDoc Quality Report");
          expect(markdown).toContain("## @beep/schema");
          expect(markdown).toContain("Improve the JSDoc block for this exported symbol");
          expect(decoded.schemaVersion).toBe(2);
        })
      )
    );
  });

  it("caps and ranks Codex remediation packets for broad quality reports", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            A.join(
              A.map(
                A.range(1, 30),
                (index) => `/**
 * Missing example fixture ${index}.
 *
 * @category parsing
 * @since 0.0.0
 */
export const value${index} = ${index};
`
              ),
              "\n"
            )
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const defaultReport = yield* analyzeDocgenQuality({
            scope: "package",
            scoreMode: "codex",
            targets: [target!],
          });
          const limitedReport = yield* analyzeDocgenQuality({
            packetLimit: 2,
            scope: "package",
            scoreMode: "codex",
            targets: [target!],
          });
          const suppressedReport = yield* analyzeDocgenQuality({
            packetLimit: 0,
            scope: "package",
            scoreMode: "codex",
            targets: [target!],
          });

          expect(defaultReport.remediationPackets).toHaveLength(25);
          expect(defaultReport.packages[0]?.omittedPacketCount).toBe(5);
          expect(limitedReport.remediationPackets).toHaveLength(2);
          expect(limitedReport.packages[0]?.summary.remediationPackets).toBe(2);
          expect(limitedReport.packages[0]?.omittedPacketCount).toBe(28);
          expect(suppressedReport.remediationPackets).toHaveLength(0);
          expect(suppressedReport.packages[0]?.omittedPacketCount).toBe(30);
        })
      )
    );
  });

  it("evaluates worker packets with a fake Codex runner", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const schemaDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          const typesDir = path.join(tmpDir, "packages", "foundation", "primitive", "types");
          yield* fs.makeDirectory(path.join(schemaDir, "src"), { recursive: true });
          yield* fs.makeDirectory(path.join(typesDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(schemaDir, "package.json"),
            encodeJson({ name: "@beep/schema", version: "0.0.0" })
          );
          yield* fs.writeFileString(
            path.join(typesDir, "package.json"),
            encodeJson({ name: "@beep/types", version: "0.0.0" })
          );
          yield* fs.writeFileString(path.join(schemaDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(path.join(typesDir, "docgen.json"), encodeJson({ srcDir: "src" }));
          yield* fs.writeFileString(
            path.join(schemaDir, "src", "index.ts"),
            `/**
 * Schema fixture without a useful example.
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );
          yield* fs.writeFileString(
            path.join(typesDir, "src", "index.ts"),
            `/**
 * Type fixture without a useful example.
 *
 * @category type-level
 * @since 0.0.0
 */
export type TypeValue = string;
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const targets = A.filter(packages, (pkg) => pkg.name === "@beep/schema" || pkg.name === "@beep/types");
          const report = yield* analyzeDocgenQuality({
            scope: "all",
            scoreMode: "codex",
            targets,
          });
          const runner: DocgenQualityWorkerEvalRunner = () =>
            Effect.succeed({
              finalResponse: encodeJson({
                localScore: 8,
                rationale: "The draft adds an observable example and keeps required tags.",
                draftJsDoc: "/**\\n * Demonstrates the exported symbol.\\n */",
                policyViolationCodes: [],
                reviewDisposition: "candidate",
              }),
            });

          const workerReport = yield* analyzeDocgenQualityWorkerEval({
            codexSdkVersion: "test-sdk",
            model: "gpt-5.4-mini",
            packetLimit: 2,
            provider: "codex",
            reasoningEffort: "low",
            report,
            runner,
            scope: "input",
            sourceQualityReport: "quality.json",
          });
          const json = yield* generateQualityWorkerEvalJson(workerReport);
          const decoded = decodeWorkerEvalReportJson(json);
          const packetPackages = pipe(
            decoded.packets,
            A.map((packet) => packet.packageName),
            A.dedupe
          );

          expect(decoded.schemaVersion).toBe(1);
          expect(decoded.provider).toBe("codex");
          expect(decoded.model).toBe("gpt-5.4-mini");
          expect(decoded.reasoningEffort).toBe("low");
          expect(decoded.codexSdkVersion).toBe("test-sdk");
          expect(decoded.summary.sourcePackets).toBeGreaterThanOrEqual(2);
          expect(decoded.summary.selectedPackets).toBe(2);
          expect(decoded.summary.completed).toBe(2);
          expect(decoded.summary.candidates).toBe(2);
          expect(packetPackages).toEqual(["@beep/schema", "@beep/types"]);

          const localProviderReport = yield* analyzeDocgenQualityWorkerEval({
            codexSdkVersion: "test-sdk",
            model: "qwen-test",
            packetLimit: 0,
            provider: "ollama",
            report,
            runner,
            scope: "input",
            sourceQualityReport: "quality.json",
          });

          expect(localProviderReport.reasoningEffort).toBeNull();

          let observedBaseUrl = O.none<string>();
          const baseUrlRunner: DocgenQualityWorkerEvalRunner = (input) => {
            observedBaseUrl = O.fromUndefinedOr(input.baseUrl);
            return Effect.succeed({
              finalResponse: encodeJson({
                localScore: 8,
                rationale: "The draft adds an observable example and keeps required tags.",
                draftJsDoc: "/**\\n * Demonstrates the exported symbol.\\n */",
                policyViolationCodes: [],
                reviewDisposition: "candidate",
              }),
            });
          };
          const baseUrlReport = yield* analyzeDocgenQualityWorkerEval({
            baseUrl: "  https://pod-11434.proxy.runpod.net/v1  ",
            codexSdkVersion: "test-sdk",
            model: "qwen3-coder:30b",
            packetLimit: 1,
            provider: "ollama",
            report,
            runner: baseUrlRunner,
            scope: "input",
            sourceQualityReport: "quality.json",
          });

          expect(baseUrlReport.summary.completed).toBe(1);
          expect(O.getOrNull(observedBaseUrl)).toBe("https://pod-11434.proxy.runpod.net/v1");

          const outOfRangeScoreRunner: DocgenQualityWorkerEvalRunner = () =>
            Effect.succeed({
              finalResponse: encodeJson({
                localScore: 11,
                rationale: "The worker returned an out-of-range score.",
                draftJsDoc: "/**\\n * Demonstrates the exported symbol.\\n */",
                policyViolationCodes: [],
                reviewDisposition: "candidate",
              }),
            });
          const outOfRangeScoreReport = yield* analyzeDocgenQualityWorkerEval({
            codexSdkVersion: "test-sdk",
            model: "gpt-5.4-mini",
            packetLimit: 1,
            provider: "codex",
            reasoningEffort: "low",
            report,
            runner: outOfRangeScoreRunner,
            scope: "input",
            sourceQualityReport: "quality.json",
          });
          const failedPacket = outOfRangeScoreReport.packets[0];

          expect(outOfRangeScoreReport.summary.failed).toBe(1);
          expect(failedPacket?.status).toBe("failed");
          expect(failedPacket?.localScore).toBeNull();
          expect(failedPacket?.error).toContain("Worker returned invalid eval JSON");
        })
      )
    );
  });

  it("wires --packet-limit through the quality CLI", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          const outputPath = path.join(tmpDir, "quality.json");
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
            A.join(
              A.map(
                A.range(1, 5),
                (index) => `/**
 * Missing example CLI fixture ${index}.
 *
 * @category parsing
 * @since 0.0.0
 */
export const cliValue${index} = ${index};
`
              ),
              "\n"
            )
          );

          yield* runDocgenCommand([
            "quality",
            "-p",
            "packages/foundation/modeling/schema",
            "--json",
            "--score",
            "codex",
            "--packet-limit",
            "2",
            "--output",
            outputPath,
          ]);

          const decoded = decodeUnknownJson(yield* fs.readFileString(outputPath)) as {
            readonly packages?: ReadonlyArray<{
              readonly omittedPacketCount?: unknown;
              readonly summary?: { readonly remediationPackets?: unknown };
            }>;
            readonly remediationPackets?: ReadonlyArray<unknown>;
          };

          expect(decoded.remediationPackets).toHaveLength(2);
          expect(decoded.packages?.[0]?.summary?.remediationPackets).toBe(2);
          expect(decoded.packages?.[0]?.omittedPacketCount).toBe(3);
        })
      )
    );
  });

  it("writes worker eval JSON from a saved quality report without requiring a live provider", {
    timeout: DOCGEN_COMMAND_TEST_TIMEOUT,
  }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          const qualityPath = path.join(tmpDir, "quality.json");
          const evalPath = path.join(tmpDir, "worker-eval.json");
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
            `/**
 * Missing example worker eval fixture.
 *
 * @category parsing
 * @since 0.0.0
 */
export const workerEvalValue = 1;
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const qualityReport = yield* analyzeDocgenQuality({
            scope: "package",
            scoreMode: "codex",
            targets: [target!],
          });
          yield* fs.writeFileString(qualityPath, yield* generateQualityJson(qualityReport));

          yield* runDocgenCommand([
            "quality-worker-eval",
            "--input",
            qualityPath,
            "--provider",
            "codex",
            "--model",
            "gpt-5.4-mini",
            "--packet-limit",
            "0",
            "--output",
            evalPath,
          ]);

          const decoded = decodeWorkerEvalReportJson(yield* fs.readFileString(evalPath));
          const logLines = yield* TestConsole.logLines;

          expect(decoded.schemaVersion).toBe(1);
          expect(decoded.scope).toBe("input");
          expect(decoded.sourceQualityReport).toBe(qualityPath);
          expect(decoded.provider).toBe("codex");
          expect(decoded.model).toBe("gpt-5.4-mini");
          expect(decoded.reasoningEffort).toBe("low");
          expect(decoded.codexSdkVersion).toMatch(/^\d+\.\d+\.\d+/);
          expect(decoded.summary.sourcePackets).toBeGreaterThan(0);
          expect(decoded.summary.selectedPackets).toBe(0);
          expect(decoded.packets).toHaveLength(0);
          expect(logLines.join("\n")).toContain(`docgen: wrote ${evalPath}`);
        })
      )
    );
  });

  it("builds Runpod Ollama pod inputs without secrets", async () => {
    const selected = selectQualityWorkerRunpodTemplate([
      new Template({
        id: "template-z",
        imageName: "runpod/pytorch:latest",
        name: "Plain PyTorch",
      }),
      new Template({
        id: "template-a",
        imageName: "ollama/ollama:latest",
        name: "Ollama CUDA",
      }),
    ]);

    expect(O.isSome(selected)).toBe(true);
    if (O.isNone(selected)) {
      return;
    }

    expect(selected.value.id).toBe("template-a");

    const body = makeQualityWorkerRunpodEvalPodCreateInput({
      gpuTypeIds: ["NVIDIA RTX A6000"],
      minRamPerGpuGb: 48,
      model: requiredQualityWorkerRunpodEvalModel(),
      podName: "beep-jsdoc-worker-eval-test",
    });
    const bootstrap = A.join(body.dockerStartCmd ?? [], "\n");

    expect(body.computeType).toBe("GPU");
    expect(body.globalNetworking).toBe(true);
    expect(body.gpuTypeIds).toEqual(["NVIDIA RTX A6000"]);
    expect(body.minRAMPerGPU).toBe(48);
    expect(body.ports).toEqual(["11434/http"]);
    expect(bootstrap).toContain("apt-get install -y curl ca-certificates zstd");
    expect(bootstrap).toContain("sha256sum -c -");
    expect(bootstrap).toContain("sh /tmp/ollama-install.sh");
    expect(bootstrap).not.toMatch(/curl.*\|\s*sh/);
    expect(bootstrap).toContain("http://127.0.0.1:11434/api/pull");
    expect(bootstrap).toContain('-d \'{"name":"qwen3-coder:30b"}\'');
    expect(bootstrap).not.toContain("RUNPOD_API_KEY");
  });

  it("guards Runpod worker eval behind explicit confirmation", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        Effect.gen(function* () {
          yield* runDocgenCommand([
            "quality-worker-eval-runpod",
            "--all",
            "--provider",
            "ollama",
            "--model",
            requiredQualityWorkerRunpodEvalModel(),
            "--gpu-type",
            "NVIDIA RTX A6000",
            "--readiness-timeout-ms",
            "1",
          ]);

          expect((yield* TestConsole.errorLines).join("\n")).toContain("--confirm-runpod-eval");
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("rejects nonpositive Runpod readiness timeout values", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        Effect.gen(function* () {
          yield* runDocgenCommand([
            "quality-worker-eval-runpod",
            "--all",
            "--provider",
            "ollama",
            "--model",
            requiredQualityWorkerRunpodEvalModel(),
            "--readiness-timeout-ms",
            "0",
            "--confirm-runpod-eval",
          ]);

          expect((yield* TestConsole.errorLines).join("\n")).toContain("--readiness-timeout-ms");
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("rejects negative --packet-limit values", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Parses a value into the normalized schema fixture.
 *
 * @example
 * \`\`\`ts
 * import { parseValue } from "@beep/schema"
 *
 * console.log(parseValue(" hello "))
 * \`\`\`
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );

          yield* runDocgenCommand(["quality", "-p", "packages/foundation/modeling/schema", "--packet-limit=-1"]);

          expect((yield* TestConsole.errorLines).join("\n")).toContain("--packet-limit must be zero or greater");
          expect(process.exitCode).toBe(1);
        })
      )
    );
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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

  it("checks docgen metadata without writing analysis files", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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

          yield* runDocgenCommand(["check", "-p", "packages/foundation/modeling/schema"]);

          const errorLines = yield* TestConsole.errorLines;
          const wroteMarkdown = yield* fs.exists(path.join(packageDir, "JSDOC_ANALYSIS.md"));
          const wroteJson = yield* fs.exists(path.join(packageDir, "JSDOC_ANALYSIS.json"));

          expect(errorLines.join("\n")).toContain("packages/foundation/modeling/schema has");
          expect(errorLines.join("\n")).toContain("<module fileoverview> missing @since");
          expect(errorLines.join("\n")).toContain("MissingMetadata missing @category, @since");
          expect(wroteMarkdown).toBe(false);
          expect(wroteJson).toBe(false);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("checks rejected category values without writing analysis files", {
    timeout: DOCGEN_COMMAND_TEST_TIMEOUT,
  }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Package docs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Rejected category fixture.
 *
 * @category exports
 * @since 0.0.0
 */
export const RejectedCategory = "nope";
`
          );

          yield* runDocgenCommand(["check", "-p", "packages/foundation/modeling/schema"]);

          const errorText = (yield* TestConsole.errorLines).join("\n");
          const wroteMarkdown = yield* fs.exists(path.join(packageDir, "JSDOC_ANALYSIS.md"));
          const wroteJson = yield* fs.exists(path.join(packageDir, "JSDOC_ANALYSIS.json"));

          expect(errorText).toContain("packages/foundation/modeling/schema has");
          expect(errorText).toContain("RejectedCategory invalid category: Re-exports are graph edges");
          expect(errorText).not.toContain("RejectedCategory missing");
          expect(wroteMarkdown).toBe(false);
          expect(wroteJson).toBe(false);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("writes report-only quality JSON without failing the command", {
    timeout: DOCGEN_COMMAND_TEST_TIMEOUT,
  }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );
          yield* fs.writeFileString(
            path.join(tmpDir, "tsconfig.json"),
            encodeJson({
              compilerOptions: {
                module: "es2022",
                target: "es2022",
                moduleResolution: "bundler",
                strict: true,
                noEmit: true,
              },
              include: ["packages/**/*.ts"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          const outputPath = path.join(tmpDir, "quality.json");
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
            `/**
 * Missing example fixture.
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseValue = (value: string): string => value.trim();
`
          );

          yield* runDocgenCommand([
            "quality",
            "-p",
            "packages/foundation/modeling/schema",
            "--json",
            "--score",
            "codex",
            "-o",
            outputPath,
          ]);

          const output = yield* fs.readFileString(outputPath);
          const decoded = decodeUnknownJson(output) as {
            readonly schemaVersion?: unknown;
            readonly scorer?: unknown;
            readonly remediationPackets?: ReadonlyArray<{ readonly prompt?: string }>;
          };
          const logText = (yield* TestConsole.logLines).join("\n");

          expect(decoded.schemaVersion).toBe(2);
          expect(decoded.scorer).toBe("codex-advisory-packet-v1");
          expect(decoded.remediationPackets?.[0]?.prompt).toContain("Keep @example mandatory");
          expect(logText).toContain("docgen: wrote");
          expect(process.exitCode).toBe(0);
        })
      )
    );
  });

  it("flags rejected category values during analysis", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Package docs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Rejected category fixture.
 *
 * @category exports
 * @since 0.0.0
 */
export const RejectedCategory = "nope";
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const analysis = yield* analyzePackageDocumentation(target!);
          const rejected = analysis.exports.find((entry) => entry.name === "RejectedCategory");

          expect(rejected?.missingTags).toEqual([]);
          expect(rejected?.categoryValues).toEqual(["exports"]);
          expect(rejected?.categoryIssues.join("\n")).toContain("Re-exports are graph edges");
          expect(analysis.summary.invalidCategory).toBe(1);
          expect(analysis.summary.missingDocumentation).toBe(1);
        })
      )
    );
  });

  it("flags rejected category values on module fileoverview during analysis", async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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
            `/**
 * Package docs.
 *
 * @packageDocumentation
 * @category exports
 * @since 0.0.0
 */

const packageDocAnchor = true;

/**
 * Valid export fixture.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ValidExport = packageDocAnchor;
`
          );

          const packages = yield* discoverDocgenWorkspacePackages(tmpDir);
          const target = packages.find((pkg) => pkg.name === "@beep/schema");

          expect(target).toBeDefined();

          const analysis = yield* analyzePackageDocumentation(target!);
          const fileoverview = analysis.exports.find((entry) => entry.name === "<module fileoverview>");

          expect(fileoverview?.missingTags).toEqual([]);
          expect(fileoverview?.categoryValues).toEqual(["exports"]);
          expect(fileoverview?.categoryIssues.join("\n")).toContain("Re-exports are graph edges");
          expect(analysis.summary.invalidCategory).toBe(1);
          expect(analysis.summary.missingDocumentation).toBe(1);
        })
      )
    );
  });

  it("returns a non-zero exit code when generate targets an unconfigured package", {
    timeout: DOCGEN_COMMAND_TEST_TIMEOUT,
  }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );

          yield* runDocgenCommand(["generate", "-p", "packages/foundation/modeling/schema"]);

          const errorLines = yield* TestConsole.errorLines;

          expect(errorLines).toEqual([
            'docgen: packages/foundation/modeling/schema is missing docgen.json. Run "bun run beep docgen init -p packages/foundation/modeling/schema" first.',
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("accepts --filter for generate and resolves it like --package", {
    timeout: DOCGEN_COMMAND_TEST_TIMEOUT,
  }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
          yield* fs.makeDirectory(path.join(packageDir, "src"), { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/schema",
              version: "0.0.0",
            })
          );

          yield* runDocgenCommand(["generate", "--filter", "packages/foundation/modeling/schema"]);

          const errorLines = yield* TestConsole.errorLines;

          expect(errorLines).toEqual([
            'docgen: packages/foundation/modeling/schema is missing docgen.json. Run "bun run beep docgen init -p packages/foundation/modeling/schema" first.',
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("rejects conflicting selector flags for generate", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          yield* runDocgenCommand([
            "generate",
            "--package",
            "packages/foundation/modeling/schema",
            "--filter",
            "@beep/schema",
          ]);

          const errorLines = yield* TestConsole.errorLines;

          expect(errorLines).toEqual([
            "docgen: Received conflicting selectors --package=packages/foundation/modeling/schema and --filter=@beep/schema.",
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("writes lint-clean docgen.json during init", { timeout: DOCGEN_COMMAND_TEST_TIMEOUT }, async () => {
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
              workspaces: ["packages/foundation/*/*"],
            })
          );

          const packageDir = path.join(tmpDir, "packages", "foundation", "modeling", "schema");
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

          yield* runDocgenCommand(["init", "-p", "packages/foundation/modeling/schema"]);

          const docgenText = yield* fs.readFileString(docgenPath);
          const docgenConfig = decodeUnknownJson(docgenText) as {
            readonly examplesCompilerOptions?: {
              readonly paths?: Record<string, ReadonlyArray<string>>;
            };
          };

          expect(docgenText).toContain('"exclude": ["src/internal/**/*.ts"],');
          expect(docgenText).toContain('"lib": ["ESNext", "DOM", "DOM.Iterable"],');
          expect(docgenConfig.examplesCompilerOptions?.paths?.["@beep/schema"]).toEqual([
            "../../../../packages/foundation/modeling/schema/src/index.ts",
          ]);
          expect(docgenConfig.examplesCompilerOptions?.paths?.["@beep/schema/*"]).toEqual([
            "../../../../packages/foundation/modeling/schema/src/*.ts",
          ]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });
});
