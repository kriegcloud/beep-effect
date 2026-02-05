/**
 * @file analyze-agents CLI Command
 *
 * CLI command for analyzing AGENTS.md files across the repository.
 * Discovers files dynamically, checks for stale references, MCP tool
 * patterns, and Effect pattern compliance.
 *
 * Usage:
 *   beep analyze-agents [options]
 *
 * Options:
 *   --format     Output format: table (default), json, or summary
 *   --filter     Scope to paths containing this substring
 *   --verbose    Show detailed output
 *
 * Examples:
 *   beep analyze-agents                          # Analyze all AGENTS.md files
 *   beep analyze-agents --format json            # JSON output
 *   beep analyze-agents --format summary         # Summary stats only
 *   beep analyze-agents --filter packages/iam    # Only IAM slice files
 *   beep analyze-agents --verbose                # Detailed discovery output
 *
 * @module analyze-agents
 * @since 1.0.0
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

import { analyzeAgentsHandler } from "./handler.js";
import { AnalyzeAgentsInput } from "./schemas.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Output format option.
 * Controls the output format: table (default), json, or summary.
 */
const formatOption = Options.choice("format", ["table", "json", "summary"]).pipe(
  Options.withDefault("table" as const),
  Options.withDescription("Output format: table, json, or summary")
);

/**
 * Filter option.
 * Scopes analysis to AGENTS.md files whose paths contain this substring.
 */
const filterOption = Options.text("filter").pipe(
  Options.optional,
  Options.withDescription('Scope to paths containing this substring (e.g., "packages/iam")')
);

/**
 * Verbose option.
 * When enabled, shows detailed discovery and analysis output.
 */
const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false),
  Options.withDescription("Show detailed output")
);

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * Combined layer providing all services needed for analyze-agents.
 * RepoUtilsLive already includes FsUtilsLive, BunFileSystem, and BunPath.
 */
const AnalyzeAgentsServiceLayer = Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * analyze-agents command definition.
 *
 * Discovers and analyzes all AGENTS.md files across the repository,
 * reporting on stale references, MCP tool patterns, and Effect
 * pattern compliance.
 *
 * @since 0.1.0
 * @category constructors
 */
export const analyzeAgentsCommand = Command.make(
  "analyze-agents",
  {
    format: formatOption,
    filter: filterOption,
    verbose: verboseOption,
  },
  ({ format, filter, verbose }) =>
    Effect.gen(function* () {
      const filterValue = O.getOrUndefined(filter);

      const input = new AnalyzeAgentsInput({
        format,
        filter: filterValue,
        verbose,
      });

      yield* analyzeAgentsHandler(input).pipe(
        Effect.catchAll((err) =>
          Effect.gen(function* () {
            yield* Console.log(color.red(`\nError: ${String(err)}`));
            yield* Effect.die(new Error(String(err)));
          })
        )
      );
    })
).pipe(
  Command.withDescription("Analyze AGENTS.md files across the repository"),
  Command.provide(AnalyzeAgentsServiceLayer)
);
