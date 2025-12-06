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
 */
export const ExitCode = {
  Success: 0,
  InvalidInput: 1,
  ConfigurationError: 2,
  ExecutionError: 3,
  PartialFailure: 4,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

// ============================================================================
// Docgen Configuration Schema
// ============================================================================

/** Schema for docgen.json compiler options */
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

export type CompilerOptions = S.Schema.Type<typeof CompilerOptionsSchema>;

/** Schema for docgen.json configuration file */
export const DocgenConfigSchema = S.Struct({
  $schema: S.optional(S.String),
  srcDir: S.optional(S.String),
  outDir: S.optional(S.String),
  srcLink: S.optional(S.String),
  exclude: S.optional(S.Array(S.String)),
  parseCompilerOptions: S.optional(CompilerOptionsSchema),
  examplesCompilerOptions: S.optional(CompilerOptionsSchema),
});

export type DocgenConfig = S.Schema.Type<typeof DocgenConfigSchema>;

// ============================================================================
// Package Discovery Types
// ============================================================================

/** Docgen status for a package */
export const PackageDocgenStatus = S.Literal("configured-and-generated", "configured-not-generated", "not-configured");

export type PackageDocgenStatus = S.Schema.Type<typeof PackageDocgenStatus>;

/** Information about a discovered package */
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

export type PackageInfo = S.Schema.Type<typeof PackageInfoSchema>;

// ============================================================================
// JSDoc Analysis Types
// ============================================================================

/** Priority level for documentation issues */
export const IssuePriority = S.Literal("high", "medium", "low");
export type IssuePriority = S.Schema.Type<typeof IssuePriority>;

/** Type of exported symbol */
export const ExportKind = S.Literal("function", "const", "type", "interface", "class", "namespace", "enum");
export type ExportKind = S.Schema.Type<typeof ExportKind>;

/** Required JSDoc tags for full documentation */
export const RequiredTags = ["@category", "@example", "@since"] as const;
export type RequiredTag = (typeof RequiredTags)[number];

/** Information about a single export's documentation status */
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
});

export type ExportAnalysis = S.Schema.Type<typeof ExportAnalysisSchema>;

/** Summary statistics for a package analysis */
export const PackageAnalysisSummarySchema = S.Struct({
  totalExports: S.Number,
  fullyDocumented: S.Number,
  missingDocumentation: S.Number,
  missingCategory: S.Number,
  missingExample: S.Number,
  missingSince: S.Number,
});

export type PackageAnalysisSummary = S.Schema.Type<typeof PackageAnalysisSummarySchema>;

/** Complete analysis result for a package */
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

export type PackageAnalysis = S.Schema.Type<typeof PackageAnalysisSchema>;

// ============================================================================
// Command Options Types
// ============================================================================

/** Options for the init command */
export interface InitOptions {
  readonly package: string;
  readonly dryRun: boolean;
  readonly force: boolean;
}

/** Options for the analyze command */
export interface AnalyzeOptions {
  readonly package: string | undefined;
  readonly output: string | undefined;
  readonly json: boolean;
  readonly fixMode: boolean;
}

/** Options for the generate command */
export interface GenerateOptions {
  readonly package: string | undefined;
  readonly validateExamples: boolean;
  readonly parallel: number;
}

/** Options for the aggregate command */
export interface AggregateOptions {
  readonly clean: boolean;
  readonly package: string | undefined;
}

/** Options for the status command */
export interface StatusOptions {
  readonly verbose: boolean;
  readonly json: boolean;
}

// ============================================================================
// Generation Result Types
// ============================================================================

/** Result of generating docs for a single package */
export const GenerationResultSchema = S.Struct({
  packageName: S.String,
  packagePath: S.String,
  success: S.Boolean,
  moduleCount: S.optional(S.Number),
  error: S.optional(S.String),
});

export type GenerationResult = S.Schema.Type<typeof GenerationResultSchema>;
