/**
 * @file Agents-Usage-Report CLI Command
 *
 * CLI command for generating agent usage telemetry reports.
 * Reads telemetry data from `.claude/.telemetry/usage.jsonl` and
 * outputs aggregated statistics per agent type.
 *
 * Usage:
 *   beep agents-usage-report [--since <date>] [--output <format>]
 *
 * Options:
 *   --since    Filter events to those on or after this date (ISO 8601 or YYYY-MM-DD)
 *   --output   Output format: table (default) or json
 *
 * Examples:
 *   beep agents-usage-report
 *   beep agents-usage-report --since 2024-01-01
 *   beep agents-usage-report --output json
 *   beep agents-usage-report --since 2024-01-15 --output json
 *
 * @module agents-usage-report
 * @since 0.1.0
 */

import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { agentsUsageReportHandler } from "./handler.js";
import { AgentsUsageReportInput, type OutputFormat } from "./schemas.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Date filter option.
 * Filters events to those on or after the specified date.
 */
const sinceOption = Options.text("since").pipe(
  Options.withDescription("Filter events on or after this date (ISO 8601 or YYYY-MM-DD)"),
  Options.withDefault("")
);

/**
 * Output format option.
 * Controls the output format: table (default) or json.
 */
const outputOption = Options.choice("output", ["table", "json"]).pipe(
  Options.withAlias("o"),
  Options.withDefault("table" as OutputFormat),
  Options.withDescription("Output format: table (default) or json")
);

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * Layer providing FileSystem for the handler.
 */
const AgentsUsageReportServiceLayer = Layer.mergeAll(BunFileSystem.layer);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Agents-usage-report command definition.
 *
 * Generates a report of agent usage telemetry data including:
 * - Number of calls per agent type
 * - Success rate per agent type
 * - Average duration per agent type
 * - Totals across all agents
 *
 * @example
 * ```ts
 * import { agentsUsageReportCommand } from "@beep/repo-cli/commands/agents-usage-report"
 * import * as Command from "@effect/cli/Command"
 *
 * // Register with parent command
 * const cli = Command.make("beep").pipe(
 *   Command.withSubcommands([agentsUsageReportCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const agentsUsageReportCommand = Command.make(
  "agents-usage-report",
  {
    since: sinceOption,
    output: outputOption,
  },
  ({ since, output }) =>
    Effect.gen(function* () {
      const input = new AgentsUsageReportInput({
        since,
        output,
      });

      yield* agentsUsageReportHandler(input);
    })
).pipe(
  Command.withDescription("Generate agent usage telemetry report"),
  Command.provide(AgentsUsageReportServiceLayer)
);
