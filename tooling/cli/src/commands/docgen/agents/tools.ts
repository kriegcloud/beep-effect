/**
 * @file Tool definitions for docgen agents.
 * @module docgen/agents/tools
 */
import { Tool, Toolkit } from "@effect/ai";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as S from "effect/Schema";
import * as Scope from "effect/Scope";
// -----------------------------------------------------------------------------
// Tool: AnalyzePackage
// -----------------------------------------------------------------------------

/**
 * Analyze a package for JSDoc coverage.
 * @category Tools
 * @since 0.1.0
 */
export const AnalyzePackage = Tool.make("AnalyzePackage", {
  description:
    "Run JSDoc analysis on a package to identify missing documentation. Returns the JSDOC_ANALYSIS.md content.",
  parameters: {
    packagePath: S.String.pipe(
      S.annotations({
        description: "Relative path to the package from repo root (e.g., 'packages/common/identity')",
      })
    ),
  },
  dependencies: [FileSystem.FileSystem, Path.Path],
  success: S.Struct({
    analysisContent: S.String,
    exportCount: S.Number,
    missingCount: S.Number,
  }),
  failure: S.String,
});

export type AnalyzePackageParams = Tool.Parameters<typeof AnalyzePackage>;

// -----------------------------------------------------------------------------
// Tool: ReadSourceFile
// -----------------------------------------------------------------------------

/**
 * Read a source file from the package.
 * @category Tools
 * @since 0.1.0
 */
export const ReadSourceFile = Tool.make("ReadSourceFile", {
  description: "Read the contents of a TypeScript source file to understand context for documentation.",
  parameters: {
    filePath: S.String.pipe(
      S.annotations({
        description: "Absolute path to the file to read",
      })
    ),
  },
  dependencies: [FileSystem.FileSystem],
  success: S.Struct({
    content: S.String,
    lineCount: S.Number,
  }),
  failure: S.String,
});

export type ReadSourceFileParams = Tool.Parameters<typeof ReadSourceFile>;

// -----------------------------------------------------------------------------
// Tool: WriteSourceFile
// -----------------------------------------------------------------------------

/**
 * Write updated content to a source file.
 * @category Tools
 * @since 0.1.0
 */
export const WriteSourceFile = Tool.make("WriteSourceFile", {
  description: "Write updated TypeScript source code with JSDoc improvements to a file.",
  parameters: {
    filePath: S.String.pipe(
      S.annotations({
        description: "Absolute path to the file to write",
      })
    ),
    content: S.String.pipe(
      S.annotations({
        description: "The complete file content to write",
      })
    ),
  },
  dependencies: [FileSystem.FileSystem],
  success: S.Struct({
    success: S.Boolean,
    bytesWritten: S.Number,
  }),
  failure: S.String,
});

export type WriteSourceFileParams = Tool.Parameters<typeof WriteSourceFile>;

// -----------------------------------------------------------------------------
// Tool: ValidateExamples
// -----------------------------------------------------------------------------

/**
 * Validate that JSDoc examples compile correctly.
 * @category Tools
 * @since 0.1.0
 */
export const ValidateExamples = Tool.make("ValidateExamples", {
  description: "Run @effect/docgen to validate that all JSDoc examples in a package compile correctly.",
  parameters: {
    packagePath: S.String.pipe(
      S.annotations({
        description: "Relative path to the package from repo root",
      })
    ),
  },
  dependencies: [FileSystem.FileSystem, Path.Path, Scope.Scope, CommandExecutor.CommandExecutor],
  success: S.Struct({
    valid: S.Boolean,
    errors: S.Array(S.String),
    moduleCount: S.Number,
  }),
  failure: S.String,
});

export type ValidateExamplesParams = Tool.Parameters<typeof ValidateExamples>;

// -----------------------------------------------------------------------------
// Tool: SearchEffectDocs
// -----------------------------------------------------------------------------

/**
 * Search Effect documentation for API patterns and examples.
 * @category Tools
 * @since 0.1.0
 */
export const SearchEffectDocs = Tool.make("SearchEffectDocs", {
  description: "Search the Effect documentation for API patterns, usage examples, and best practices.",
  parameters: {
    query: S.String.pipe(
      S.annotations({
        description: "Search query for Effect documentation",
      })
    ),
  },
  success: S.Struct({
    results: S.Array(
      S.Struct({
        title: S.String,
        content: S.String,
        documentId: S.Number,
      })
    ),
  }),
  failure: S.String,
});

export type SearchEffectDocsParams = Tool.Parameters<typeof SearchEffectDocs>;

// -----------------------------------------------------------------------------
// Tool: ListPackageExports
// -----------------------------------------------------------------------------

/**
 * List all exports from a package's index file.
 * @category Tools
 * @since 0.1.0
 */
export const ListPackageExports = Tool.make("ListPackageExports", {
  description: "Get a list of all public exports from a package to understand what needs documentation.",
  parameters: {
    packagePath: S.String.pipe(
      S.annotations({
        description: "Relative path to the package from repo root",
      })
    ),
  },
  dependencies: [FileSystem.FileSystem, Path.Path],
  success: S.Struct({
    exports: S.Array(
      S.Struct({
        name: S.String,
        kind: S.Literal("function", "const", "type", "interface", "class", "namespace", "enum"),
        filePath: S.String,
        line: S.Number,
        hasJsDoc: S.Boolean,
      })
    ),
  }),
  failure: S.String,
});

export type ListPackageExportsParams = Tool.Parameters<typeof ListPackageExports>;

// -----------------------------------------------------------------------------
// DocFixer Toolkit
// -----------------------------------------------------------------------------

/**
 * Complete toolkit for the DocFixer agent.
 * @category Toolkits
 * @since 0.1.0
 */
export const DocFixerToolkit = Toolkit.make(
  AnalyzePackage,
  ReadSourceFile,
  WriteSourceFile,
  ValidateExamples,
  SearchEffectDocs,
  ListPackageExports
);

export type DocFixerToolkit = typeof DocFixerToolkit;
