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
 *
 * @example
 * ```ts
 * import { AnalyzePackage } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* AnalyzePackage({
 *     packagePath: "packages/common/identity"
 *   })
 *   console.log(`Found ${result.missingCount} of ${result.exportCount} exports need docs`)
 * })
 * ```
 *
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
 *
 * @example
 * ```ts
 * import { ReadSourceFile } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ReadSourceFile({
 *     filePath: "/home/user/beep-effect/packages/common/identity/src/index.ts"
 *   })
 *   console.log(`Read ${result.lineCount} lines`)
 * })
 * ```
 *
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
 *
 * @example
 * ```ts
 * import { WriteSourceFile } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* WriteSourceFile({
 *     filePath: "/home/user/beep-effect/packages/common/identity/src/index.ts",
 *     content: "export const foo = 'bar'"
 *   })
 *   console.log(`Wrote ${result.bytesWritten} bytes`)
 * })
 * ```
 *
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
// Tool: InsertJsDoc
// -----------------------------------------------------------------------------

/**
 * Insert or replace JSDoc comments at specific lines.
 *
 * @example
 * ```ts
 * import { InsertJsDoc } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* InsertJsDoc({
 *     filePath: "/path/to/file.ts",
 *     jsDocContent: "/** Description *" + "/",
 *     insertAtLine: 10,
 *   })
 *   console.log(`Inserted ${result.linesInserted} lines`)
 * })
 * ```
 *
 * @category Tools
 * @since 0.1.0
 */
export const InsertJsDoc = Tool.make("InsertJsDoc", {
  description: "Insert a JSDoc comment at a specific line, or replace an existing JSDoc block.",
  parameters: {
    filePath: S.String.pipe(
      S.annotations({
        description: "Absolute path to the file to modify",
      })
    ),
    jsDocContent: S.String.pipe(
      S.annotations({
        description: "The JSDoc comment content to insert (including /** and */)",
      })
    ),
    insertAtLine: S.Number.pipe(
      S.annotations({
        description: "Line number where to insert the JSDoc (1-indexed)",
      })
    ),
    replaceStartLine: S.NullishOr(S.Number).pipe(
      S.annotations({
        description: "If replacing, start line of existing JSDoc to remove (1-indexed)",
      })
    ),
    replaceEndLine: S.NullishOr(S.Number).pipe(
      S.annotations({
        description: "If replacing, end line of existing JSDoc to remove (1-indexed)",
      })
    ),
  },
  dependencies: [FileSystem.FileSystem],
  success: S.Struct({
    success: S.Boolean,
    linesInserted: S.Number,
    linesRemoved: S.Number,
  }),
  failure: S.String,
});

export type InsertJsDocParams = Tool.Parameters<typeof InsertJsDoc>;

// -----------------------------------------------------------------------------
// Tool: ValidateExamples
// -----------------------------------------------------------------------------

/**
 * Validate that JSDoc examples compile correctly.
 *
 * @example
 * ```ts
 * import { ValidateExamples } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ValidateExamples({
 *     packagePath: "packages/common/identity"
 *   })
 *
 *   if (result.valid) {
 *     console.log(`All examples in ${result.moduleCount} modules are valid`)
 *   } else {
 *     const errorList = F.pipe(result.errors, A.join("\n"))
 *     console.error(`Validation errors:\n${errorList}`)
 *   }
 * })
 * ```
 *
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
 *
 * @example
 * ```ts
 * import { SearchEffectDocs } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SearchEffectDocs({
 *     query: "Effect.gen"
 *   })
 *
 *   const titles = F.pipe(
 *     result.results,
 *     A.map((doc) => doc.title)
 *   )
 *   console.log(`Found ${titles.length} results`)
 * })
 * ```
 *
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
 *
 * @example
 * ```ts
 * import { ListPackageExports } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ListPackageExports({
 *     packagePath: "packages/common/identity"
 *   })
 *
 *   const missingDocs = F.pipe(
 *     result.exports,
 *     A.filter((exp) => !exp.hasJsDoc)
 *   )
 *   console.log(`${missingDocs.length} exports missing JSDoc`)
 * })
 * ```
 *
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
 *
 * @example
 * ```ts
 * import { DocFixerToolkit } from "@beep/repo-cli/commands/docgen/agents/tools"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const toolkit = DocFixerToolkit
 *   console.log("Toolkit ready with all docgen tools")
 *   return toolkit
 * })
 * ```
 *
 * @category Toolkits
 * @since 0.1.0
 */
export const DocFixerToolkit = Toolkit.make(
  AnalyzePackage,
  ReadSourceFile,
  WriteSourceFile,
  InsertJsDoc,
  ValidateExamples,
  SearchEffectDocs,
  ListPackageExports
);

export type DocFixerToolkit = typeof DocFixerToolkit;
