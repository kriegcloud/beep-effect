/**
 * @file Context-Freshness Input Validation Schemas
 *
 * Defines Effect Schema validation for context-freshness command inputs.
 * Provides type-safe validation for freshness check configuration and output.
 *
 * @module context-freshness/schemas
 * @since 1.0.0
 */

import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Output Format
// -----------------------------------------------------------------------------

/**
 * Output format options.
 *
 * @since 0.1.0
 * @category schemas
 */
export const OutputFormat = S.Literal("table", "json");
export type OutputFormat = S.Schema.Type<typeof OutputFormat>;

// -----------------------------------------------------------------------------
// Freshness Status
// -----------------------------------------------------------------------------

/**
 * Status indicating freshness level of a source.
 *
 * @since 0.1.0
 * @category schemas
 */
export const FreshnessStatus = S.Literal("fresh", "warning", "critical");
export type FreshnessStatus = S.Schema.Type<typeof FreshnessStatus>;

// -----------------------------------------------------------------------------
// Category
// -----------------------------------------------------------------------------

/**
 * Category of the scanned item.
 *
 * @since 0.1.0
 * @category schemas
 */
export const ItemCategory = S.Literal("effect-repo", "context", "skill");
export type ItemCategory = S.Schema.Type<typeof ItemCategory>;

// -----------------------------------------------------------------------------
// Command Input
// -----------------------------------------------------------------------------

/**
 * Input schema for the context-freshness command.
 *
 * @since 0.1.0
 * @category schemas
 */
export class FreshnessCheckInput extends S.Class<FreshnessCheckInput>("FreshnessCheckInput")({
  /** Days until warning threshold (default: 30) */
  thresholdWarningDays: S.optionalWith(S.Number, { default: () => 30 }),
  /** Days until critical threshold (default: 60) */
  thresholdCriticalDays: S.optionalWith(S.Number, { default: () => 60 }),
  /** Output format: table (default) or json */
  format: S.optionalWith(OutputFormat, { default: () => "table" as const }),
}) {}

// -----------------------------------------------------------------------------
// Freshness Item
// -----------------------------------------------------------------------------

/**
 * Single item in the freshness report.
 *
 * @since 0.1.0
 * @category models
 */
export const FreshnessItem = S.Struct({
  path: S.String,
  category: ItemCategory,
  lastModified: S.String,
  ageInDays: S.Number,
  status: FreshnessStatus,
});
export type FreshnessItem = S.Schema.Type<typeof FreshnessItem>;

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------

/**
 * Summary counts for the freshness report.
 *
 * @since 0.1.0
 * @category models
 */
export const FreshnessSummary = S.Struct({
  fresh: S.Number,
  warning: S.Number,
  critical: S.Number,
});
export type FreshnessSummary = S.Schema.Type<typeof FreshnessSummary>;

// -----------------------------------------------------------------------------
// Report
// -----------------------------------------------------------------------------

/**
 * Complete freshness report.
 *
 * @since 0.1.0
 * @category models
 */
export const FreshnessReport = S.Struct({
  scannedAt: S.String,
  summary: FreshnessSummary,
  items: S.Array(FreshnessItem),
  hasCritical: S.Boolean,
});
export type FreshnessReport = S.Schema.Type<typeof FreshnessReport>;

// -----------------------------------------------------------------------------
// Threshold Configuration
// -----------------------------------------------------------------------------

/**
 * Threshold configuration per category.
 *
 * @since 0.1.0
 * @category models
 */
export interface CategoryThresholds {
  readonly warning: number;
  readonly critical: number;
}

/**
 * Default thresholds by category.
 *
 * @since 0.1.0
 * @category constants
 */
export const DEFAULT_THRESHOLDS: Record<ItemCategory, CategoryThresholds> = {
  "effect-repo": { warning: 30, critical: 60 },
  context: { warning: 30, critical: 45 },
  skill: { warning: 60, critical: 90 },
};
