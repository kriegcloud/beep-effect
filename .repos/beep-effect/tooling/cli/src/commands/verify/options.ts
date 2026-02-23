/**
 * @file Verify Command Shared Options
 *
 * Reusable CLI options for all verify subcommands.
 *
 * @module verify/options
 * @since 0.1.0
 */

import * as Options from "@effect/cli/Options";

// -----------------------------------------------------------------------------
// Shared Options
// -----------------------------------------------------------------------------

/**
 * Package filter option.
 *
 * Filters packages by name pattern (e.g., @beep/iam-*).
 *
 * @since 0.1.0
 * @category options
 */
export const filterOption = Options.text("filter").pipe(
  Options.optional,
  Options.withAlias("f"),
  Options.withDescription("Filter packages by name pattern (e.g., @beep/iam-*)")
);

/**
 * Output format option.
 *
 * Determines how violations are displayed:
 * - table: Tabular format with columns
 * - json: Machine-readable JSON output
 * - summary: Condensed summary counts only
 *
 * @since 0.1.0
 * @category options
 */
export const formatOption = Options.choice("format", ["table", "json", "summary"]).pipe(
  Options.withDefault("table" as const),
  Options.withDescription("Output format: table, json, or summary")
);

/**
 * Severity filter option.
 *
 * Filters violations by severity level.
 *
 * @since 0.1.0
 * @category options
 */
export const severityOption = Options.choice("severity", ["critical", "warning", "all"]).pipe(
  Options.withDefault("all" as const),
  Options.withDescription("Filter by violation severity")
);

/**
 * CI mode option.
 *
 * When enabled, exits with non-zero code if violations are found.
 *
 * @since 0.1.0
 * @category options
 */
export const ciOption = Options.boolean("ci").pipe(
  Options.withDefault(false),
  Options.withDescription("CI mode: exit non-zero on violations")
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Output format type.
 *
 * @since 0.1.0
 * @category models
 */
export type OutputFormat = "table" | "json" | "summary";

/**
 * Severity filter type.
 *
 * @since 0.1.0
 * @category models
 */
export type SeverityFilter = "critical" | "warning" | "all";
