/**
 * @file analyze-readmes Input and Output Schemas
 *
 * Defines Effect Schema validation for analyze-readmes command inputs
 * and analysis result models.
 *
 * @module analyze-readmes/schemas
 * @since 1.0.0
 */

import * as S from "effect/Schema";

/**
 * Analysis results for a single README.md file.
 *
 * @since 0.1.0
 * @category schemas
 */
export class ReadmeAnalysis extends S.Class<ReadmeAnalysis>("ReadmeAnalysis")({
  lineCount: S.Number,
  titleMatch: S.Boolean,
  hasInstallSection: S.Boolean,
  hasUsageSection: S.Boolean,
  hasKeyExportsSection: S.Boolean,
  hasDependenciesSection: S.Boolean,
  hasEffectImports: S.Boolean,
  hasBeepImports: S.Boolean,
  hasNativeArrayMethods: S.Boolean,
  hasAsyncAwait: S.Boolean,
}) {}

/**
 * Information about a single workspace package and its README status.
 *
 * @since 0.1.0
 * @category schemas
 */
export class PackageInfo extends S.Class<PackageInfo>("PackageInfo")({
  path: S.String,
  packageName: S.optional(S.String),
  description: S.optional(S.String),
  hasReadme: S.Boolean,
  hasAgentsMd: S.Boolean,
  readme: S.optional(ReadmeAnalysis),
}) {}

/**
 * Output format for the report.
 *
 * @since 0.1.0
 * @category models
 */
export type OutputFormat = "table" | "json" | "summary";

/**
 * Input schema for the analyze-readmes command.
 *
 * @since 0.1.0
 * @category schemas
 */
export class AnalyzeReadmesInput extends S.Class<AnalyzeReadmesInput>("AnalyzeReadmesInput")({
  format: S.String,
  filter: S.optional(S.String),
  output: S.optional(S.String),
}) {}
