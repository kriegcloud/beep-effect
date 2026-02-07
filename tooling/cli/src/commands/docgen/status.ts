/**
 * @file Docgen Status Command
 *
 * Shows docgen configuration status across all workspace packages.
 * Provides a comprehensive view of which packages have docgen configured
 * and which have generated documentation.
 *
 * Behavior:
 * 1. Scan all workspace packages
 * 2. Categorize by docgen status:
 *    - Configured & Generated: Has docgen.json and docs/modules/
 *    - Configured (not generated): Has docgen.json but no docs/
 *    - Not Configured: No docgen.json
 * 3. Report coverage statistics
 *
 * Options:
 * - --verbose, -v: Show detailed configuration for each package
 * - --json: Output as JSON
 *
 * Exit Codes:
 * - 0: Success (always - this is informational only)
 *
 * Output Example:
 * ```
 * Docgen Status Report
 * ====================
 *
 * Configured & Generated (6):
 *   [check] @beep/identity         packages/common/identity
 *   [check] @beep/schema           packages/common/schema
 *   ...
 *
 * Configured (not generated) (0):
 *
 * Not Configured (30):
 *   [circle] @beep/schema         packages/common/schema
 *   ...
 *
 * Coverage: 6/36 packages (17%)
 * ```
 *
 * @module docgen/status
 * @since 0.1.0
 * @see DOCGEN_CLI_IMPLEMENTATION.md#5-beep-docgen-status
 */

import type * as FsUtils from "@beep/tooling-utils/FsUtils";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import type * as FileSystem from "@effect/platform/FileSystem";
import type * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { loadDocgenConfig } from "./shared/config.js";
import { discoverAllPackages } from "./shared/discovery.js";
import { DocgenLogger, DocgenLoggerLive } from "./shared/logger.js";
import { blank, formatCoverage, formatPackageStatus, header } from "./shared/output.js";

// Options
const verboseOption = CliOptions.boolean("verbose").pipe(
  CliOptions.withAlias("v"),
  CliOptions.withDefault(false),
  CliOptions.withDescription("Show detailed configuration for each package")
);

const jsonOption = CliOptions.boolean("json").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Output as JSON")
);

/**
 * Handle the status command.
 */
const handleStatus = (args: {
  readonly verbose: boolean;
  readonly json: boolean;
}): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path | FsUtils.FsUtils | DocgenLogger> =>
  Effect.gen(function* () {
    const logger = yield* DocgenLogger;

    yield* logger.info("Starting status", {
      verbose: args.verbose,
      json: args.json,
    });

    // Discover all packages
    const allPackages = yield* discoverAllPackages;

    // Group packages by status
    const grouped = {
      configuredAndGenerated: F.pipe(
        allPackages,
        A.filter((p) => p.status === "configured-and-generated")
      ),
      configuredNotGenerated: F.pipe(
        allPackages,
        A.filter((p) => p.status === "configured-not-generated")
      ),
      notConfigured: F.pipe(
        allPackages,
        A.filter((p) => p.status === "not-configured")
      ),
    };

    // If --json, output JSON and exit
    if (args.json) {
      const output = {
        packages: F.pipe(
          allPackages,
          A.map((p) => ({
            name: p.name,
            relativePath: p.relativePath,
            status: p.status,
            hasDocgenConfig: p.hasDocgenConfig,
            hasGeneratedDocs: p.hasGeneratedDocs,
          }))
        ),
        summary: {
          total: A.length(allPackages),
          configuredAndGenerated: A.length(grouped.configuredAndGenerated),
          configuredNotGenerated: A.length(grouped.configuredNotGenerated),
          notConfigured: A.length(grouped.notConfigured),
        },
      };

      yield* Console.log(JSON.stringify(output, null, 2));
      return;
    }

    // Print formatted report
    yield* header("Docgen Status Report");
    yield* blank();

    // Configured & Generated section
    yield* Console.log(`Configured & Generated (${A.length(grouped.configuredAndGenerated)}):`);
    if (A.isEmptyArray(grouped.configuredAndGenerated)) {
      yield* Console.log("  (none)");
    } else {
      yield* Effect.forEach(grouped.configuredAndGenerated, (pkg) => Console.log(formatPackageStatus(pkg)), {
        discard: true,
      });
    }
    yield* blank();

    // Configured (not generated) section
    yield* Console.log(`Configured (not generated) (${A.length(grouped.configuredNotGenerated)}):`);
    if (A.isEmptyArray(grouped.configuredNotGenerated)) {
      yield* Console.log("  (none)");
    } else {
      yield* Effect.forEach(grouped.configuredNotGenerated, (pkg) => Console.log(formatPackageStatus(pkg)), {
        discard: true,
      });
    }
    yield* blank();

    // Not Configured section
    yield* Console.log(`Not Configured (${A.length(grouped.notConfigured)}):`);
    if (A.isEmptyArray(grouped.notConfigured)) {
      yield* Console.log("  (none)");
    } else {
      yield* Effect.forEach(grouped.notConfigured, (pkg) => Console.log(formatPackageStatus(pkg)), { discard: true });
    }
    yield* blank();

    // Coverage summary
    const configured = A.length(grouped.configuredAndGenerated) + A.length(grouped.configuredNotGenerated);
    yield* Console.log(`Coverage: ${formatCoverage(configured, A.length(allPackages))}`);

    yield* logger.info("Status complete", {
      total: A.length(allPackages),
      configuredAndGenerated: A.length(grouped.configuredAndGenerated),
      configuredNotGenerated: A.length(grouped.configuredNotGenerated),
      notConfigured: A.length(grouped.notConfigured),
    });

    // Verbose mode: show config details
    if (args.verbose && A.length(grouped.configuredAndGenerated) > 0) {
      yield* blank();
      yield* header("Configuration Details");

      yield* Effect.forEach(
        grouped.configuredAndGenerated,
        (pkg) =>
          Effect.gen(function* () {
            const config = yield* loadDocgenConfig(pkg.absolutePath).pipe(
              Effect.catchAll(() =>
                Effect.succeed({
                  srcDir: "src",
                  outDir: "docs",
                  exclude: [] as string[],
                })
              )
            );

            yield* Console.log(`\n${pkg.name}:`);
            yield* Console.log(`  srcDir: ${config.srcDir ?? "src"}`);
            yield* Console.log(`  outDir: ${config.outDir ?? "docs"}`);
            yield* Console.log(`  exclude: ${F.pipe(config.exclude ?? [], A.join(", ")) || "none"}`);
          }),
        { discard: true }
      );
    }
  });

/**
 * CLI command to show docgen configuration status across all packages in the monorepo.
 *
 * @example
 * ```ts
 * import { statusCommand } from "@beep/repo-cli/commands/docgen/status"
 * import * as CliCommand from "@effect/cli/Command"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* CliCommand.run(statusCommand, {
 *     name: "docgen",
 *     version: "1.0.0"
 *   })
 *   return result
 * })
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const statusCommand = CliCommand.make("status", { verbose: verboseOption, json: jsonOption }, (args) =>
  handleStatus(args).pipe(Effect.provide(DocgenLoggerLive()))
).pipe(CliCommand.withDescription("Show docgen configuration status across packages"));
