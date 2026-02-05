/**
 * @file analyze-agents Input and Output Schemas
 *
 * Defines Effect Schema validation for analyze-agents command inputs
 * and per-file analysis results.
 *
 * @module analyze-agents/schemas
 * @since 1.0.0
 */

import * as S from "effect/Schema";

/**
 * Input schema for the analyze-agents command.
 *
 * @since 0.1.0
 * @category schemas
 */
export class AnalyzeAgentsInput extends S.Class<AnalyzeAgentsInput>("AnalyzeAgentsInput")({
  /** Output format: table, json, or summary */
  format: S.String,
  /** Optional glob filter to scope which AGENTS.md files are analyzed */
  filter: S.optional(S.String),
  /** When true, show detailed output */
  verbose: S.Boolean,
}) {}

/**
 * Per-file analysis result for an AGENTS.md file.
 *
 * @since 0.1.0
 * @category schemas
 */
export class AgentsMdAnalysis extends S.Class<AgentsMdAnalysis>("AgentsMdAnalysis")({
  /** Relative path from repository root */
  path: S.String,
  /** Package name from sibling package.json, or "N/A" */
  packageName: S.String,
  /** Number of lines in the file */
  lineCount: S.Number,
  /** Whether a sibling package.json exists */
  hasPackageJson: S.Boolean,
  /** Whether a sibling README.md exists */
  hasReadme: S.Boolean,
  /** Count of stale references to deleted packages */
  staleRefs: S.Number,
  /** Whether the file contains MCP tool patterns */
  hasMcpTools: S.Boolean,
  /** Whether the file passes Effect pattern compliance checks */
  effectCompliant: S.Boolean,
  /** List of detected issues */
  issues: S.Array(S.String),
}) {}
