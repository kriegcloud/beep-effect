/**
 * @file Schema definitions for durable workflow payloads and results.
 *
 * All schemas used by the docgen agents workflow for:
 * - Workflow input/output
 * - Activity results
 * - Token usage tracking
 *
 * @module docgen/agents/schemas
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
 * import { DocgenWorkflowPayload } from "./schemas.js"
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
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
 * @category Schemas
 * @since 0.1.0
 */
export const DocgenWorkflowResult = S.Struct({
  results: S.Array(PackageFixResultSchema),
  totalExportsFixed: S.Number,
  totalTokens: S.Number,
  durationMs: S.Number,
});

export type DocgenWorkflowResult = S.Schema.Type<typeof DocgenWorkflowResult>;
