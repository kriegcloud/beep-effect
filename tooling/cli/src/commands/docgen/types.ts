/**
 * @file Docgen CLI Type Definitions
 *
 * Core type definitions shared across all docgen CLI commands.
 * Includes schemas for docgen.json configuration, analysis results,
 * and package discovery types.
 *
 * Key exports:
 * - ExitCode: Standard exit codes for all commands
 * - DocgenConfig/DocgenConfigSchema: Configuration file schema
 * - PackageInfo/PackageDocgenStatus: Package discovery types
 * - ExportAnalysis/PackageAnalysis: JSDoc analysis types
 * - Command option interfaces for each subcommand
 *
 * @module docgen/types
 * @since 0.1.0
 */

import * as S from "effect/Schema";

// ============================================================================
// Exit Codes
// ============================================================================

/**
 * Exit codes used by all docgen commands.
 *
 * - Success (0): Command completed without errors
 * - InvalidInput (1): Missing package.json, invalid path
 * - ConfigurationError (2): Malformed docgen.json, schema validation failure
 * - ExecutionError (3): docgen process failed, ts-morph parsing error
 * - PartialFailure (4): Some packages succeeded, others failed
 *
 * @example
 * ```ts
 * import { ExitCode } from "@beep/repo-cli/commands/docgen/types"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   yield* Effect.log("Command completed")
 *   return ExitCode.Success
 * })
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export const ExitCode = {
  Success: 0,
  InvalidInput: 1,
  ConfigurationError: 2,
  ExecutionError: 3,
  PartialFailure: 4,
} as const;

/**
 * Exit code type extracted from the ExitCode constant.
 *
 * @example
 * ```ts
 * import type { ExitCode } from "@beep/repo-cli/commands/docgen/types"
 *
 * const handleResult = (code: ExitCode): string => {
 *   return code === 0 ? "Success" : "Failure"
 * }
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

// ============================================================================
// Docgen Configuration Schema
// ============================================================================

/**
 * Schema for docgen.json compiler options.
 *
 * @example
 * ```ts
 * import { CompilerOptionsSchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const options = S.decodeUnknownSync(CompilerOptionsSchema)({
 *   noEmit: true,
 *   strict: true,
 *   paths: { "@beep/*": ["../../packages/*  /src/index.ts"] }
 * })
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export const CompilerOptionsSchema = S.Struct({
  noEmit: S.optional(S.Boolean),
  strict: S.optional(S.Boolean),
  skipLibCheck: S.optional(S.Boolean),
  moduleResolution: S.optional(S.String),
  module: S.optional(S.String),
  target: S.optional(S.String),
  lib: S.optional(S.Array(S.String)),
  paths: S.optional(S.Record({ key: S.String, value: S.Array(S.String) })),
});

/**
 * Compiler options type inferred from schema.
 *
 * @example
 * ```ts
 * import type { CompilerOptions } from "@beep/repo-cli/commands/docgen/types"
 *
 * const config: CompilerOptions = {
 *   noEmit: true,
 *   strict: true
 * }
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type CompilerOptions = S.Schema.Type<typeof CompilerOptionsSchema>;

/**
 * Schema for docgen.json configuration file.
 *
 * @example
 * ```ts
 * import { DocgenConfigSchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownSync(DocgenConfigSchema)({
 *   srcDir: "src",
 *   outDir: "docs",
 *   exclude: ["src/internal/"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export const DocgenConfigSchema = S.Struct({
  $schema: S.optional(S.String),
  srcDir: S.optional(S.String),
  outDir: S.optional(S.String),
  srcLink: S.optional(S.String),
  exclude: S.optional(S.Array(S.String)),
  parseCompilerOptions: S.optional(CompilerOptionsSchema),
  examplesCompilerOptions: S.optional(CompilerOptionsSchema),
});

/**
 * Docgen configuration type inferred from schema.
 *
 * @example
 * ```ts
 * import type { DocgenConfig } from "@beep/repo-cli/commands/docgen/types"
 *
 * const config: DocgenConfig = {
 *   srcDir: "src",
 *   outDir: "docs",
 *   exclude: ["src/internal/"]
 * }
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export type DocgenConfig = S.Schema.Type<typeof DocgenConfigSchema>;

// ============================================================================
// Package Discovery Types
// ============================================================================

/**
 * Schema representing the docgen configuration and documentation status of a package.
 *
 * @example
 * ```ts
 * import { PackageDocgenStatus } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const status = S.decodeUnknownSync(PackageDocgenStatus)("configured-and-generated")
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const PackageDocgenStatus = S.Literal("configured-and-generated", "configured-not-generated", "not-configured");

/**
 * Type representing docgen status: configured with docs, configured without docs, or not configured.
 *
 * @example
 * ```ts
 * import type { PackageDocgenStatus } from "@beep/repo-cli/commands/docgen/types"
 *
 * const checkStatus = (status: PackageDocgenStatus): boolean => {
 *   return status === "configured-and-generated"
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type PackageDocgenStatus = S.Schema.Type<typeof PackageDocgenStatus>;

/**
 * Schema for information about a discovered package in the monorepo.
 *
 * @example
 * ```ts
 * import { PackageInfoSchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const info = S.decodeUnknownSync(PackageInfoSchema)({
 *   name: "@beep/schema",
 *   relativePath: "packages/common/schema",
 *   absolutePath: "/home/user/beep-effect/packages/common/schema",
 *   hasDocgenConfig: true,
 *   hasGeneratedDocs: false,
 *   status: "configured-not-generated"
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const PackageInfoSchema = S.Struct({
  /** Package name from package.json (e.g., "@beep/schema") */
  name: S.String,
  /** Relative path from repo root (e.g., "packages/common/schema") */
  relativePath: S.String,
  /** Absolute path to package directory */
  absolutePath: S.String,
  /** Whether docgen.json exists */
  hasDocgenConfig: S.Boolean,
  /** Whether docs/modules/ directory exists */
  hasGeneratedDocs: S.Boolean,
  /** Computed status */
  status: PackageDocgenStatus,
});

/**
 * Type representing information about a discovered package.
 *
 * @example
 * ```ts
 * import type { PackageInfo } from "@beep/repo-cli/commands/docgen/types"
 *
 * const displayPackage = (pkg: PackageInfo): string => {
 *   return `${pkg.name} (${pkg.status})`
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type PackageInfo = S.Schema.Type<typeof PackageInfoSchema>;

// ============================================================================
// JSDoc Analysis Types
// ============================================================================

/**
 * Schema for priority levels of documentation issues based on missing required tags.
 *
 * @example
 * ```ts
 * import { IssuePriority } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const priority = S.decodeUnknownSync(IssuePriority)("high")
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const IssuePriority = S.Literal("high", "medium", "low");

/**
 * Type representing documentation issue priority: high (missing all tags), medium (missing some), low (fully documented).
 *
 * @example
 * ```ts
 * import type { IssuePriority } from "@beep/repo-cli/commands/docgen/types"
 *
 * const sortByPriority = (a: IssuePriority, b: IssuePriority): number => {
 *   const order = { high: 0, medium: 1, low: 2 }
 *   return order[a] - order[b]
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type IssuePriority = S.Schema.Type<typeof IssuePriority>;

/**
 * Schema for the kind/type of an exported symbol in TypeScript.
 *
 * @example
 * ```ts
 * import { ExportKind } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const kind = S.decodeUnknownSync(ExportKind)("function")
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const ExportKind = S.Literal(
  "function",
  "const",
  "type",
  "interface",
  "class",
  "namespace",
  "enum",
  "re-export",
  "module-fileoverview"
);

/**
 * Type representing the kind of TypeScript export symbol.
 *
 * @example
 * ```ts
 * import type { ExportKind } from "@beep/repo-cli/commands/docgen/types"
 *
 * const describeExport = (kind: ExportKind): string => {
 *   return `This is a ${kind} export`
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type ExportKind = S.Schema.Type<typeof ExportKind>;

/**
 * Array of required JSDoc tags that must be present for an export to be considered fully documented.
 *
 * @example
 * ```ts
 * import { RequiredTags } from "@beep/repo-cli/commands/docgen/types"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const checkTags = (presentTags: readonly string[]): boolean => {
 *   return F.pipe(
 *     RequiredTags,
 *     A.every((tag) => presentTags.includes(tag))
 *   )
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export const RequiredTags = ["@category", "@example", "@since"] as const;

/**
 * Type representing a single required JSDoc tag.
 *
 * @example
 * ```ts
 * import type { RequiredTag } from "@beep/repo-cli/commands/docgen/types"
 *
 * const formatTag = (tag: RequiredTag): string => {
 *   return `Missing ${tag} tag`
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type RequiredTag = (typeof RequiredTags)[number];

/**
 * Schema for detailed documentation status analysis of a single export.
 *
 * @example
 * ```ts
 * import { ExportAnalysisSchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const analysis = S.decodeUnknownSync(ExportAnalysisSchema)({
 *   name: "createUser",
 *   kind: "function",
 *   filePath: "src/User.ts",
 *   line: 42,
 *   presentTags: ["@param", "@returns"],
 *   missingTags: ["@category", "@example", "@since"],
 *   hasJsDoc: true,
 *   priority: "high",
 *   insertionLine: 41,
 *   declarationSource: "export const createUser = ..."
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const ExportAnalysisSchema = S.Struct({
  /** Name of the export */
  name: S.String,
  /** Type of export (function, const, type, etc.) */
  kind: ExportKind,
  /** Source file path relative to package */
  filePath: S.String,
  /** Line number where export is declared */
  line: S.Number,
  /** Tags that are present */
  presentTags: S.Array(S.String),
  /** Required tags that are missing */
  missingTags: S.Array(S.String),
  /** Whether export has any JSDoc at all */
  hasJsDoc: S.Boolean,
  /** Brief context about what this export does (first line of JSDoc or inferred) */
  context: S.optional(S.String),
  /** Computed priority based on missing tags */
  priority: IssuePriority,

  // Granular editing fields
  /** Line number where JSDoc should be inserted (line before export declaration) */
  insertionLine: S.Number,
  /** If export has existing JSDoc, the start line of that JSDoc block */
  existingJsDocStartLine: S.optional(S.Number),
  /** If export has existing JSDoc, the end line of that JSDoc block */
  existingJsDocEndLine: S.optional(S.Number),
  /** The actual source code of the export declaration (for AI context) */
  declarationSource: S.String,
  /** 3-5 lines of context before the export (imports, other exports) */
  contextBefore: S.optional(S.String),
});

/**
 * Type representing the documentation status of a single export.
 *
 * @example
 * ```ts
 * import type { ExportAnalysis } from "@beep/repo-cli/commands/docgen/types"
 *
 * const formatExport = (exp: ExportAnalysis): string => {
 *   return `${exp.name} (${exp.kind}) - ${exp.missingTags.length} missing tags`
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type ExportAnalysis = S.Schema.Type<typeof ExportAnalysisSchema>;

/**
 * Schema for summary statistics of a package documentation analysis.
 *
 * @example
 * ```ts
 * import { PackageAnalysisSummarySchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const summary = S.decodeUnknownSync(PackageAnalysisSummarySchema)({
 *   totalExports: 100,
 *   fullyDocumented: 25,
 *   missingDocumentation: 75,
 *   missingCategory: 50,
 *   missingExample: 60,
 *   missingSince: 50
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const PackageAnalysisSummarySchema = S.Struct({
  totalExports: S.Number,
  fullyDocumented: S.Number,
  missingDocumentation: S.Number,
  missingCategory: S.Number,
  missingExample: S.Number,
  missingSince: S.Number,
});

/**
 * Type representing summary statistics of package documentation coverage.
 *
 * @example
 * ```ts
 * import type { PackageAnalysisSummary } from "@beep/repo-cli/commands/docgen/types"
 *
 * const coverage = (summary: PackageAnalysisSummary): number => {
 *   return (summary.fullyDocumented / summary.totalExports) * 100
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type PackageAnalysisSummary = S.Schema.Type<typeof PackageAnalysisSummarySchema>;

/**
 * Schema for the complete documentation analysis result of a package.
 *
 * @example
 * ```ts
 * import { PackageAnalysisSchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const analysis = S.decodeUnknownSync(PackageAnalysisSchema)({
 *   packageName: "@beep/schema",
 *   packagePath: "packages/common/schema",
 *   timestamp: "2025-12-06T12:00:00.000Z",
 *   exports: [],
 *   summary: {
 *     totalExports: 0,
 *     fullyDocumented: 0,
 *     missingDocumentation: 0,
 *     missingCategory: 0,
 *     missingExample: 0,
 *     missingSince: 0
 *   }
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const PackageAnalysisSchema = S.Struct({
  /** Package name */
  packageName: S.String,
  /** Package path */
  packagePath: S.String,
  /** Timestamp of analysis */
  timestamp: S.String,
  /** All analyzed exports */
  exports: S.Array(ExportAnalysisSchema),
  /** Summary statistics */
  summary: PackageAnalysisSummarySchema,
});

/**
 * Type representing the complete analysis result for a package.
 *
 * @example
 * ```ts
 * import type { PackageAnalysis } from "@beep/repo-cli/commands/docgen/types"
 *
 * const reportCoverage = (analysis: PackageAnalysis): void => {
 *   console.log(`${analysis.packageName}: ${analysis.summary.fullyDocumented}/${analysis.summary.totalExports}`)
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type PackageAnalysis = S.Schema.Type<typeof PackageAnalysisSchema>;

// ============================================================================
// Command Options Types
// ============================================================================

/**
 * Options for the docgen init command.
 *
 * @example
 * ```ts
 * import type { InitOptions } from "@beep/repo-cli/commands/docgen/types"
 *
 * const opts: InitOptions = {
 *   package: "packages/common/schema",
 *   dryRun: false,
 *   force: true
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface InitOptions {
  readonly package: string;
  readonly dryRun: boolean;
  readonly force: boolean;
}

/**
 * Options for the docgen analyze command.
 *
 * @example
 * ```ts
 * import type { AnalyzeOptions } from "@beep/repo-cli/commands/docgen/types"
 *
 * const opts: AnalyzeOptions = {
 *   package: "packages/common/schema",
 *   output: "JSDOC_ANALYSIS.md",
 *   json: false,
 *   fixMode: true
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface AnalyzeOptions {
  readonly package: string | undefined;
  readonly output: string | undefined;
  readonly json: boolean;
  readonly fixMode: boolean;
}

/**
 * Options for the docgen generate command.
 *
 * @example
 * ```ts
 * import type { GenerateOptions } from "@beep/repo-cli/commands/docgen/types"
 *
 * const opts: GenerateOptions = {
 *   package: "packages/common/schema",
 *   validateExamples: true,
 *   parallel: 4
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface GenerateOptions {
  readonly package: string | undefined;
  readonly validateExamples: boolean;
  readonly parallel: number;
}

/**
 * Options for the docgen aggregate command.
 *
 * @example
 * ```ts
 * import type { AggregateOptions } from "@beep/repo-cli/commands/docgen/types"
 *
 * const opts: AggregateOptions = {
 *   clean: true,
 *   package: undefined
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface AggregateOptions {
  readonly clean: boolean;
  readonly package: string | undefined;
}

/**
 * Options for the docgen status command.
 *
 * @example
 * ```ts
 * import type { StatusOptions } from "@beep/repo-cli/commands/docgen/types"
 *
 * const opts: StatusOptions = {
 *   verbose: true,
 *   json: false
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface StatusOptions {
  readonly verbose: boolean;
  readonly json: boolean;
}

// ============================================================================
// Generation Result Types
// ============================================================================

/**
 * Schema for the result of generating documentation for a single package.
 *
 * @example
 * ```ts
 * import { GenerationResultSchema } from "@beep/repo-cli/commands/docgen/types"
 * import * as S from "effect/Schema"
 *
 * const result = S.decodeUnknownSync(GenerationResultSchema)({
 *   packageName: "@beep/schema",
 *   packagePath: "packages/common/schema",
 *   success: true,
 *   moduleCount: 15
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const GenerationResultSchema = S.Struct({
  packageName: S.String,
  packagePath: S.String,
  success: S.Boolean,
  moduleCount: S.optional(S.Number),
  error: S.optional(S.String),
});

/**
 * Type representing the outcome of documentation generation for a package.
 *
 * @example
 * ```ts
 * import type { GenerationResult } from "@beep/repo-cli/commands/docgen/types"
 *
 * const reportResult = (result: GenerationResult): string => {
 *   return result.success ? `Generated ${result.moduleCount} modules` : `Failed: ${result.error}`
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type GenerationResult = S.Schema.Type<typeof GenerationResultSchema>;
