/**
 * @file analyze-readmes CLI Command
 *
 * CLI command for analyzing README.md files across workspace packages.
 * Checks for compliance with project documentation standards including
 * required sections, Effect import patterns, and anti-pattern detection.
 *
 * Usage:
 *   beep analyze-readmes [options]
 *
 * Options:
 *   --format     Output format: table, json, or summary (default: table)
 *   --filter     Filter packages by name pattern
 *   --output     Write report to file instead of stdout
 *
 * Examples:
 *   beep analyze-readmes                              # Full table report
 *   beep analyze-readmes --format summary             # Summary stats only
 *   beep analyze-readmes --format json                # JSON output
 *   beep analyze-readmes --filter @beep/iam           # Filter by name
 *   beep analyze-readmes --output report.md           # Write to file
 *
 * @module analyze-readmes
 * @since 0.1.0
 */

import { RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import color from "picocolors";

import { analyzeReadmesHandler } from "./handler.js";
import { AnalyzeReadmesInput } from "./schemas.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Output format option.
 *
 * Determines report output format:
 * - table: Full markdown report with inventory table and gap analysis
 * - json: Machine-readable JSON array of PackageInfo
 * - summary: Condensed summary statistics only
 */
const formatOption = Options.choice("format", ["table", "json", "summary"]).pipe(
  Options.withDefault("table" as const),
  Options.withDescription("Output format: table, json, or summary")
);

/**
 * Package filter option.
 *
 * Filters workspace packages by name pattern.
 */
const filterOption = Options.text("filter").pipe(
  Options.optional,
  Options.withDescription("Filter packages by name pattern")
);

/**
 * Output file option.
 *
 * When specified, writes the report to a file instead of stdout.
 */
const outputOption = Options.text("output").pipe(
  Options.optional,
  Options.withDescription("Write report to file instead of stdout")
);

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * Combined layer providing all services needed for analyze-readmes.
 */
const AnalyzeReadmesServiceLayer = Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * analyze-readmes command definition.
 *
 * Analyzes README.md files across workspace packages for compliance
 * with project documentation standards.
 *
 * @since 0.1.0
 * @category constructors
 */
export const analyzeReadmesCommand = Command.make(
  "analyze-readmes",
  {
    format: formatOption,
    filter: filterOption,
    output: outputOption,
  },
  ({ format, filter, output }) =>
    Effect.gen(function* () {
      const filterValue = O.getOrUndefined(filter);
      const outputValue = O.getOrUndefined(output);

      const input = new AnalyzeReadmesInput({
        format,
        filter: filterValue,
        output: outputValue,
      });

      yield* analyzeReadmesHandler(input).pipe(
        Effect.catchAll((err) =>
          Effect.gen(function* () {
            yield* Console.log(color.red(`\nError: ${String(err)}`));
            yield* Effect.die(new Error(String(err)));
          })
        )
      );
    })
).pipe(
  Command.withDescription("Analyze README.md files across workspace packages"),
  Command.provide(AnalyzeReadmesServiceLayer)
);
