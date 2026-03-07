/**
 * @file tsconfig-sync CLI Command
 *
 * CLI command for synchronizing tsconfig references and dependencies.
 * Automates maintenance of TypeScript project references based on
 * package.json dependencies.
 *
 * Usage:
 *   beep tsconfig-sync [options]
 *
 * Options:
 *   --check      Validate without modification (exit code 1 on drift)
 *   --dry-run    Preview changes without writing files
 *   --filter     Scope to specific package (e.g., "@beep/iam-server")
 *   --no-hoist   Skip transitive dependency hoisting
 *   --pre-commit Scope to staged relevant files when possible
 *   --verbose    Show detailed output
 *
 * Examples:
 *   beep tsconfig-sync                          # Sync all packages
 *   beep tsconfig-sync --check                  # CI validation mode
 *   beep tsconfig-sync --dry-run                # Preview changes
 *   beep tsconfig-sync --filter @beep/iam-server # Sync specific package
 *
 * @module tsconfig-sync
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

import type { DriftDetectedError } from "./errors.js";
import { tsconfigSyncHandler } from "./handler.js";
import { TsconfigSyncInput } from "./schemas.js";

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

/**
 * Check mode option.
 * When enabled, validates without modification and exits with code 1 on drift.
 */
const checkOption = Options.boolean("check").pipe(
  Options.withDefault(false),
  Options.withDescription("Validate without modification (exit code 1 on drift)")
);

/**
 * Dry-run mode option.
 * When enabled, previews changes without writing files.
 */
const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Preview changes without writing files")
);

/**
 * Filter option.
 * Scopes sync to a specific package.
 */
const filterOption = Options.text("filter").pipe(
  Options.optional,
  Options.withDescription('Scope to specific package (e.g., "@beep/iam-server")')
);

/**
 * No-hoist option.
 * When enabled, skips transitive dependency hoisting.
 */
const noHoistOption = Options.boolean("no-hoist").pipe(
  Options.withDefault(false),
  Options.withDescription("Skip transitive dependency hoisting")
);

/**
 * Pre-commit option.
 * When enabled, scopes config sync to staged relevant files when possible.
 */
const preCommitOption = Options.boolean("pre-commit").pipe(
  Options.withDefault(false),
  Options.withDescription("Run in pre-commit mode (scope to staged relevant files when possible)")
);

/**
 * Verbose option.
 * When enabled, shows detailed output.
 */
const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false),
  Options.withDescription("Show detailed output")
);

/**
 * Packages-only option.
 * When enabled, only syncs packages (skips apps).
 */
const packagesOnlyOption = Options.boolean("packages-only").pipe(
  Options.withDefault(false),
  Options.withDescription("Only sync packages (skip apps)")
);

/**
 * Apps-only option.
 * When enabled, only syncs apps (skips packages).
 */
const appsOnlyOption = Options.boolean("apps-only").pipe(
  Options.withDefault(false),
  Options.withDescription("Only sync apps (skip packages)")
);

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * Combined layer providing all services needed for tsconfig-sync.
 */
const TsconfigSyncServiceLayer = Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * tsconfig-sync command definition.
 *
 * Synchronizes tsconfig references and dependencies based on package.json.
 *
 * @example
 * ```ts
 * import { tsconfigSyncCommand } from "@beep/repo-cli/commands/tsconfig-sync"
 * import * as Command from "@effect/cli/Command"
 *
 * // Register with parent command
 * const cli = Command.make("beep").pipe(
 *   Command.withSubcommands([tsconfigSyncCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const tsconfigSyncCommand = Command.make(
  "tsconfig-sync",
  {
    check: checkOption,
    dryRun: dryRunOption,
    filter: filterOption,
    noHoist: noHoistOption,
    preCommit: preCommitOption,
    verbose: verboseOption,
    packagesOnly: packagesOnlyOption,
    appsOnly: appsOnlyOption,
  },
  ({ check, dryRun, filter, noHoist, preCommit, verbose, packagesOnly, appsOnly }) =>
    Effect.gen(function* () {
      // Convert Option<string> to string | undefined
      const filterValue = O.getOrUndefined(filter);

      // Create validated input
      const input = new TsconfigSyncInput({
        check,
        dryRun,
        filter: filterValue,
        noHoist,
        preCommit,
        verbose,
        packagesOnly,
        appsOnly,
      });

      // Execute handler with error handling
      yield* tsconfigSyncHandler(input).pipe(
        Effect.catchTag("CyclicDependencyError", (err) =>
          Effect.gen(function* () {
            yield* Console.log(color.red("\nError: Circular dependency detected"));
            yield* Console.log(color.yellow("Unable to sync due to circular dependencies."));
            yield* Console.log(color.yellow("Please resolve the following cycles first:"));
            for (const cycle of err.cycles) {
              yield* Console.log(color.yellow(`  ${cycle.join(" → ")}`));
            }
            yield* Effect.die(new Error("Circular dependency detected"));
          })
        ),
        Effect.catchIf(
          (err): err is DriftDetectedError =>
            "_tag" in err && (err as { _tag: string })._tag.endsWith("DriftDetectedError"),
          (err) =>
            Effect.gen(function* () {
              yield* Console.log(color.red(`\nDrift detected: ${err.summary}`));
              yield* Console.log(color.yellow("Run without --check to apply fixes."));
              yield* Effect.die(new Error("Configuration drift detected"));
            })
        ),
        Effect.catchAll((err) =>
          Effect.gen(function* () {
            const message =
              typeof err === "object" &&
              err !== null &&
              "displayMessage" in err &&
              typeof err.displayMessage === "string"
                ? err.displayMessage
                : String(err);
            yield* Console.log(color.red(`\nError: ${message}`));
            yield* Effect.die(new Error(message));
          })
        )
      );
    })
).pipe(
  Command.withDescription("Sync package dependency policy and tsconfig references from package.json"),
  Command.provide(TsconfigSyncServiceLayer)
);
