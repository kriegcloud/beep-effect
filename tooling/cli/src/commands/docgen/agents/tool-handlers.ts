/**
 * @file Tool handler implementations for docgen agents.
 * @module docgen/agents/tool-handlers
 */

import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { analyzePackage } from "../shared/ast.js";
import { loadDocgenConfig } from "../shared/config.js";
import { generateAnalysisReport } from "../shared/markdown.js";
import { DocFixerToolkit } from "./tools.js";

/**
 * Create the DocFixer toolkit layer with all tool handlers.
 * @category Layers
 * @since 0.1.0
 */
export const DocFixerToolkitLive = DocFixerToolkit.toLayer({
  AnalyzePackage: ({ packagePath }) =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const repoRoot = yield* findRepoRoot;

      const absolutePath = path.resolve(repoRoot, packagePath);
      const config = yield* loadDocgenConfig(absolutePath);

      const srcDir = config.srcDir ?? "src";
      const exclude = config.exclude ?? A.empty();

      const exports = yield* analyzePackage(absolutePath, srcDir, exclude);

      const analysis = {
        packageName: packagePath,
        packagePath: absolutePath,
        timestamp: DateTime.formatIso(DateTime.unsafeNow()),
        exports,
        summary: {
          totalExports: A.length(exports),
          fullyDocumented: F.pipe(
            exports,
            A.filter((e) => A.isEmptyReadonlyArray(e.missingTags)),
            A.length
          ),
          missingDocumentation: F.pipe(
            exports,
            A.filter((e) => A.isNonEmptyReadonlyArray(e.missingTags)),
            A.length
          ),
          missingCategory: F.pipe(
            exports,
            A.filter((e) => F.pipe(e.missingTags, A.contains("@category"))),
            A.length
          ),
          missingExample: F.pipe(
            exports,
            A.filter((e) => F.pipe(e.missingTags, A.contains("@example"))),
            A.length
          ),
          missingSince: F.pipe(
            exports,
            A.filter((e) => F.pipe(e.missingTags, A.contains("@since"))),
            A.length
          ),
        },
      };

      const report = generateAnalysisReport(analysis);

      return {
        analysisContent: report,
        exportCount: analysis.summary.totalExports,
        missingCount: analysis.summary.missingDocumentation,
      };
    }).pipe(Effect.mapError((e) => `Failed to analyze package: ${String(e)}`)),

  ReadSourceFile: ({ filePath }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const content = yield* fs.readFileString(filePath);
      const lines = F.pipe(content, Str.split("\n"));

      return {
        content,
        lineCount: A.length(lines),
      };
    }).pipe(Effect.mapError((e) => `Failed to read file: ${String(e)}`)),

  WriteSourceFile: ({ filePath, content }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.writeFileString(filePath, content);

      return {
        success: true,
        bytesWritten: new TextEncoder().encode(content).length,
      };
    }).pipe(Effect.mapError((e) => `Failed to write file: ${String(e)}`)),

  ValidateExamples: ({ packagePath }) =>
    Effect.gen(function* () {
      const executor = yield* CommandExecutor.CommandExecutor;
      const path = yield* Path.Path;
      const repoRoot = yield* findRepoRoot;

      const absolutePath = path.resolve(repoRoot, packagePath);

      const command = Command.make("bunx", "@effect/docgen", "--validate-examples").pipe(
        Command.workingDirectory(absolutePath)
      );

      const result = yield* executor.start(command).pipe(
        Effect.flatMap((process) => process.exitCode),
        Effect.map((exitCode) => exitCode === 0),
        Effect.catchAll(() => Effect.succeed(false))
      );

      return {
        valid: result,
        errors: result ? A.empty<string>() : A.make("Validation failed - check docgen output"),
        moduleCount: 0,
      };
    }).pipe(Effect.mapError((e) => `Failed to validate examples: ${String(e)}`)),

  SearchEffectDocs: ({ query }) =>
    Effect.gen(function* () {
      yield* Effect.logInfo(`Searching Effect docs for: ${query}`);

      // Placeholder - would integrate with MCP in production
      return {
        results: [
          {
            title: "Effect Documentation",
            content: `Search results for "${query}" would appear here when MCP is integrated.`,
            documentId: 0,
          },
        ],
      };
    }).pipe(Effect.mapError((e) => `Failed to search docs: ${String(e)}`)),

  ListPackageExports: ({ packagePath }) =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const repoRoot = yield* findRepoRoot;

      const absolutePath = path.resolve(repoRoot, packagePath);
      const config = yield* loadDocgenConfig(absolutePath);

      const srcDir = config.srcDir ?? "src";
      const exclude = config.exclude ?? A.empty();

      const exports = yield* analyzePackage(absolutePath, srcDir, exclude);

      return {
        exports: F.pipe(
          exports,
          A.map((e) => ({
            name: e.name,
            kind: e.kind,
            filePath: e.filePath,
            line: e.line,
            hasJsDoc: e.hasJsDoc,
          }))
        ),
      };
    }).pipe(Effect.mapError((e) => `Failed to list exports: ${String(e)}`)),
});
