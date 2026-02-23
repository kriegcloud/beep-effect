/**
 * @file Schema definitions for durable workflow payloads and results.
 *
 * All schemas used by the docgen agents workflow for:
 * - Workflow input/output
 * - Activity results
 * - Token usage tracking
 *
 * @module docgen/agents/schemas
 * @since 1.0.0
 */
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Workflow Payload
// -----------------------------------------------------------------------------

/**
 * Input payload for the DocgenAgents workflow.
 *
 * @example
 * ```typescript
 * import { DocgenWorkflowPayload } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const payload = S.decodeUnknownSync(DocgenWorkflowPayload)({
 *   packagePaths: ["packages/common/identity"],
 *   dryRun: false,
 *   model: "claude-sonnet-4-20250514",
 *   maxIterations: 20,
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const DocgenWorkflowPayload = S.Struct({
  /** Package paths to process (relative to repo root) */
  packagePaths: S.Array(S.String),
  /** Whether to skip file writes */
  dryRun: S.Boolean,
  /** Claude model ID to use */
  model: S.String,
  /** Maximum iterations per package */
  maxIterations: S.Number,
});

export type DocgenWorkflowPayload = S.Schema.Type<typeof DocgenWorkflowPayload>;

// -----------------------------------------------------------------------------
// Token Usage Schema
// -----------------------------------------------------------------------------

/**
 * Token usage statistics from Anthropic API.
 *
 * @example
 * ```typescript
 * import { TokenUsageSchema } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const usage = S.decodeUnknownSync(TokenUsageSchema)({
 *   inputTokens: 1000,
 *   outputTokens: 500,
 *   totalTokens: 1500,
 *   reasoningTokens: 200,
 *   cachedInputTokens: 300,
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const TokenUsageSchema = S.Struct({
  inputTokens: S.Number,
  outputTokens: S.Number,
  totalTokens: S.Number,
  reasoningTokens: S.Number,
  cachedInputTokens: S.Number,
});

export type TokenUsage = S.Schema.Type<typeof TokenUsageSchema>;

// -----------------------------------------------------------------------------
// Activity Results
// -----------------------------------------------------------------------------

/**
 * Result of reading package configuration.
 *
 * @example
 * ```typescript
 * import { ConfigResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownSync(ConfigResult)({
 *   packagePath: "packages/common/schema",
 *   srcDir: "src",
 *   exclude: ["test-files"],
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const ConfigResult = S.Struct({
  packagePath: S.String,
  srcDir: S.String,
  exclude: S.Array(S.String),
});

export type ConfigResult = S.Schema.Type<typeof ConfigResult>;

/**
 * File to fix with missing JSDoc tags.
 *
 * @example
 * ```typescript
 * import { FileToFix } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const fileToFix = S.decodeUnknownSync(FileToFix)({
 *   filePath: "src/schema.ts",
 *   exportName: "EmailEncoded",
 *   missingTags: ["@example", "@since"],
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const FileToFix = S.Struct({
  filePath: S.String,
  exportName: S.String,
  missingTags: S.Array(S.String),
});

export type FileToFix = S.Schema.Type<typeof FileToFix>;

/**
 * Result of analyzing a package for JSDoc coverage.
 *
 * @example
 * ```typescript
 * import { AnalysisResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const analysis = S.decodeUnknownSync(AnalysisResult)({
 *   packagePath: "packages/common/schema",
 *   exportCount: 42,
 *   missingCount: 5,
 *   filesToFix: [],
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const AnalysisResult = S.Struct({
  packagePath: S.String,
  exportCount: S.Number,
  missingCount: S.Number,
  filesToFix: S.Array(FileToFix),
});

export type AnalysisResult = S.Schema.Type<typeof AnalysisResult>;

/**
 * Result of an AI call to fix JSDoc.
 *
 * @example
 * ```typescript
 * import { AICallResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const result = S.decodeUnknownSync(AICallResult)({
 *   filePath: "src/schema.ts",
 *   content: "export const EmailEncoded = S.String",
 *   tokensUsed: 1500,
 *   inputTokens: 1000,
 *   outputTokens: 500,
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const AICallResult = S.Struct({
  filePath: S.String,
  content: S.String,
  tokensUsed: S.Number,
  inputTokens: S.Number,
  outputTokens: S.Number,
});

export type AICallResult = S.Schema.Type<typeof AICallResult>;

/**
 * Result of writing a file.
 *
 * @example
 * ```typescript
 * import { WriteResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const writeResult = S.decodeUnknownSync(WriteResult)({
 *   filePath: "src/schema.ts",
 *   bytesWritten: 4096,
 *   success: true,
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const WriteResult = S.Struct({
  filePath: S.String,
  bytesWritten: S.Number,
  success: S.Boolean,
});

export type WriteResult = S.Schema.Type<typeof WriteResult>;

/**
 * Result of reading a file.
 *
 * @example
 * ```typescript
 * import { ReadFileResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const readResult = S.decodeUnknownSync(ReadFileResult)({
 *   filePath: "src/schema.ts",
 *   content: "export const EmailEncoded = S.String",
 *   lineCount: 120,
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReadFileResult = S.Struct({
  filePath: S.String,
  content: S.String,
  lineCount: S.Number,
});

export type ReadFileResult = S.Schema.Type<typeof ReadFileResult>;

/**
 * Result of validating examples.
 *
 * @example
 * ```typescript
 * import { ValidationResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const validation = S.decodeUnknownSync(ValidationResult)({
 *   packagePath: "packages/common/schema",
 *   valid: true,
 *   errors: [],
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const ValidationResult = S.Struct({
  packagePath: S.String,
  valid: S.Boolean,
  errors: S.Array(S.String),
});

export type ValidationResult = S.Schema.Type<typeof ValidationResult>;

// -----------------------------------------------------------------------------
// Package Fix Result
// -----------------------------------------------------------------------------

/**
 * Result of fixing a single package.
 *
 * @example
 * ```typescript
 * import { PackageFixResultSchema } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const result = S.decodeUnknownSync(PackageFixResultSchema)({
 *   packageName: "@beep/schema",
 *   packagePath: "packages/common/schema",
 *   success: true,
 *   exportsFixed: 10,
 *   exportsRemaining: 0,
 *   validationPassed: true,
 *   errors: [],
 *   durationMs: 45000,
 *   tokenUsage: {
 *     inputTokens: 5000,
 *     outputTokens: 2500,
 *     totalTokens: 7500,
 *     reasoningTokens: 1000,
 *     cachedInputTokens: 1500,
 *   },
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const PackageFixResultSchema = S.Struct({
  packageName: S.String,
  packagePath: S.String,
  success: S.Boolean,
  exportsFixed: S.Number,
  exportsRemaining: S.Number,
  validationPassed: S.Boolean,
  errors: S.Array(S.String),
  durationMs: S.Number,
  tokenUsage: TokenUsageSchema,
});

export type PackageFixResult = S.Schema.Type<typeof PackageFixResultSchema>;

// -----------------------------------------------------------------------------
// Workflow Result
// -----------------------------------------------------------------------------

/**
 * Final result of the DocgenAgents workflow.
 *
 * @example
 * ```typescript
 * import { DocgenWorkflowResult } from "@beep/repo-cli/commands/docgen/agents"
 * import * as S from "effect/Schema"
 *
 * const workflowResult = S.decodeUnknownSync(DocgenWorkflowResult)({
 *   results: [],
 *   totalExportsFixed: 25,
 *   totalTokens: 15000,
 *   durationMs: 120000,
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const DocgenWorkflowResult = S.Struct({
  results: S.Array(PackageFixResultSchema),
  totalExportsFixed: S.Number,
  totalTokens: S.Number,
  durationMs: S.Number,
});

export type DocgenWorkflowResult = S.Schema.Type<typeof DocgenWorkflowResult>;
