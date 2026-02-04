/**
 * @file Context-Freshness CLI Command
 *
 * CLI command for checking staleness of context sources.
 * Scans Effect repository, context files, and skills for freshness.
 *
 * Usage:
 *   beep context-freshness [--format <format>]
 *
 * Options:
 *   --format    Output format: table (default) or json
 *
 * Examples:
 *   beep context-freshness
 *   beep context-freshness --format json
 *
 * Exit codes:
 *   0 - No critical staleness detected
 *   1 - Critical staleness detected (sources need updating)
 *
 * @module context-freshness
 * @since 1.0.0
 */

import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as BunCommandExecutor from "@effect/platform-bun/BunCommandExecutor";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { CriticalStalenessError } from "./errors.js";
import { contextFreshnessHandler } from "./handler.js";
import { FreshnessCheckInput, type OutputFormat } from "./schemas.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Output format option.
 * Controls the output format: table (default) or json.
 */
const formatOption = Options.choice("format", ["table", "json"]).pipe(
  Options.withAlias("f"),
  Options.withDefault("table" as OutputFormat),
  Options.withDescription("Output format: table (default) or json")
);

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * Layer providing FileSystem and CommandExecutor for the handler.
 */
const ContextFreshnessServiceLayer = Layer.mergeAll(
  BunFileSystem.layer,
  BunCommandExecutor.layer
);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Context-freshness command definition.
 *
 * Scans context sources and reports staleness:
 * - .repos/effect/ - Git repository last commit date
 * - context/effect/ - File modification times
 * - context/platform/ - File modification times
 * - .claude/skills/SKILL.md - Skill file modification times
 *
 * @example
 * ```ts
 * import { contextFreshnessCommand } from "@beep/repo-cli/commands/context-freshness"
 * import * as Command from "@effect/cli/Command"
 *
 * // Register with parent command
 * const cli = Command.make("beep").pipe(
 *   Command.withSubcommands([contextFreshnessCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const contextFreshnessCommand = Command.make(
  "context-freshness",
  {
    format: formatOption,
  },
  ({ format }) =>
    Effect.gen(function* () {
      const input = new FreshnessCheckInput({
        format,
      });

      const hasCritical = yield* contextFreshnessHandler(input);

      // Exit with code 1 if critical staleness detected
      if (hasCritical) {
        return yield* Effect.fail(
          new CriticalStalenessError({
            message: "Critical staleness detected. See report above.",
            criticalCount: 1,
          })
        );
      }
    })
).pipe(
  Command.withDescription("Check freshness of context sources (Effect repo, context files, skills)"),
  Command.provide(ContextFreshnessServiceLayer)
);
