/**
 * @file Docgen Generate Command
 *
 * Runs @effect/docgen for one or all configured packages.
 * Executes docgen as a child process and reports results.
 *
 * Behavior:
 * 1. Discover all packages with docgen.json
 * 2. Run `bunx @effect/docgen` for each package
 * 3. Report success/failure per package
 * 4. On failure, suggest running analyze command for diagnostics
 *
 * Options:
 * - --package, -p <path>: Target specific package (default: all with docgen.json)
 * - --validate-examples: Type-check and execute @example blocks
 * - --parallel, -j <n>: Concurrency limit (default: 4)
 *
 * Exit Codes:
 * - 0: Success (all packages generated)
 * - 1: Invalid input (package not found)
 * - 3: Execution error (docgen failed)
 * - 4: Partial failure (some packages failed)
 *
 * @module docgen/generate
 * @see DOCGEN_CLI_IMPLEMENTATION.md#3-beep-docgen-generate
 */

import type { FsUtils } from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as Command from "@effect/platform/Command";
import type * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { discoverConfiguredPackages, resolvePackagePath } from "./shared/discovery.js";
import { blank, error, formatPackageResult, header, info, symbols, warning } from "./shared/output.js";
import type { GenerationResult, PackageInfo } from "./types.js";
import { ExitCode } from "./types.js";

// Options
const packageOption = CliOptions.optional(CliOptions.text("package")).pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target specific package (default: all with docgen.json)")
);

const validateExamplesOption = CliOptions.boolean("validate-examples").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Type-check and execute @example blocks")
);

const parallelOption = CliOptions.integer("parallel").pipe(
  CliOptions.withAlias("j"),
  CliOptions.withDefault(4),
  CliOptions.withDescription("Concurrency limit for parallel execution")
);

const jsonOption = CliOptions.boolean("json").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Output results as JSON")
);

/**
 * Run docgen for a single package.
 */
const runDocgen = (
  pkg: PackageInfo,
  validateExamples: boolean
): Effect.Effect<GenerationResult, never, CommandExecutor.CommandExecutor | FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;

    // Build command arguments - docgen validates by default when running
    const args: string[] = ["@effect/docgen"];
    if (validateExamples) {
      args.push("--validate-examples");
    }

    const command = Command.make("bunx", ...args).pipe(Command.workingDirectory(pkg.absolutePath));

    // Run the command and capture exit code
    const result = yield* Effect.gen(function* () {
      const process = yield* Command.start(command);

      // Consume stdout and stderr to avoid blocking
      yield* Effect.all([Stream.runDrain(process.stdout), Stream.runDrain(process.stderr)], { concurrency: 2 });

      return yield* process.exitCode;
    }).pipe(
      Effect.scoped,
      Effect.catchAll(
        (_e) => Effect.succeed(1) // Treat any error as failure
      )
    );

    if (result === 0) {
      // Count generated modules
      const docsPath = path.join(pkg.absolutePath, "docs", "modules");
      const docsExist = yield* fs.exists(docsPath).pipe(Effect.orElseSucceed(F.constFalse));

      let moduleCount: number | undefined = undefined;
      if (docsExist) {
        const files = yield* fs
          .readDirectory(docsPath)
          .pipe(Effect.catchAll(() => Effect.succeed(A.empty() as string[])));
        moduleCount = F.pipe(files, A.filter(Str.endsWith(".md")), A.length);
      }

      return {
        packageName: pkg.name,
        packagePath: pkg.relativePath,
        success: true,
        moduleCount,
      };
    }

    return {
      packageName: pkg.name,
      packagePath: pkg.relativePath,
      success: false,
      error: `docgen exited with code ${result}`,
    };
  });

/**
 * Handle the generate command.
 */
const handleGenerate = (args: {
  readonly package: string | undefined;
  readonly validateExamples: boolean;
  readonly parallel: number;
  readonly json: boolean;
}): Effect.Effect<void, never, CommandExecutor.CommandExecutor | FileSystem.FileSystem | Path.Path | FsUtils.FsUtils> =>
  Effect.gen(function* () {
    // Resolve target packages
    let packages: ReadonlyArray<PackageInfo>;

    if (args.package !== undefined) {
      // Single package mode
      const pkgInfo = yield* resolvePackagePath(args.package).pipe(
        Effect.catchAll((e) =>
          Effect.gen(function* () {
            yield* error(
              `Invalid package path: ${e.path} - ${e._tag === "InvalidPackagePathError" ? e.reason : (e.message ?? "not found")}`
            );
            return yield* Effect.fail(ExitCode.InvalidInput);
          })
        )
      );
      packages = [pkgInfo];
    } else {
      // All configured packages mode
      packages = yield* discoverConfiguredPackages;
    }

    if (A.isEmptyArray([...packages])) {
      if (args.json) {
        const output = {
          packages: A.empty() as ReadonlyArray<{
            packageName: string;
            packagePath: string;
            success: boolean;
            error?: string;
            moduleCount?: number;
          }>,
          summary: { total: 0, succeeded: 0, failed: 0 },
        };
        yield* Console.log(JSON.stringify(output, null, 2));
        return;
      }
      yield* warning("No packages with docgen.json found");
      return;
    }

    if (!args.json) {
      yield* info(`Generating documentation for ${A.length(packages)} package(s)...`);
      yield* blank();
    }

    // Run docgen for each package with concurrency
    const results = yield* Effect.forEach([...packages], (pkg) => runDocgen(pkg, args.validateExamples), {
      concurrency: args.parallel,
    });

    // Calculate summary
    const successCount = F.pipe(
      results,
      A.filter((r) => r.success),
      A.length
    );
    const failureCount = A.length(results) - successCount;

    // If --json, output JSON and exit
    if (args.json) {
      const output = {
        packages: F.pipe(
          results,
          A.map((r) => ({
            packageName: r.packageName,
            packagePath: r.packagePath,
            success: r.success,
            ...(r.error !== undefined ? { error: r.error } : {}),
            ...(r.moduleCount !== undefined ? { moduleCount: r.moduleCount } : {}),
          }))
        ),
        summary: {
          total: A.length(results),
          succeeded: successCount,
          failed: failureCount,
        },
      };

      yield* Console.log(JSON.stringify(output, null, 2));

      // Still set exit code for CI usage
      if (failureCount > 0) {
        if (failureCount === A.length(results)) {
          yield* Effect.sync(() => {
            process.exitCode = ExitCode.ExecutionError;
          });
        } else {
          yield* Effect.sync(() => {
            process.exitCode = ExitCode.PartialFailure;
          });
        }
      }
      return;
    }

    // Report results (non-JSON mode)
    yield* header("Generation Results");

    yield* Effect.forEach(results, (r) => Console.log(formatPackageResult(r)), { discard: true });

    yield* blank();
    yield* Console.log(`Generated docs for ${successCount}/${A.length(results)} packages`);

    // Handle failures
    if (failureCount > 0) {
      yield* blank();

      // Show failed packages with suggestion
      const failedPackages = F.pipe(
        results,
        A.filter((r) => !r.success)
      );

      yield* Effect.forEach(
        failedPackages,
        (r) => Console.log(`  ${symbols.arrow} Run: beep docgen analyze -p ${r.packagePath}`),
        { discard: true }
      );

      // Set exit code based on results
      if (failureCount === A.length(results)) {
        yield* Effect.sync(() => {
          process.exitCode = ExitCode.ExecutionError;
        });
      } else {
        yield* Effect.sync(() => {
          process.exitCode = ExitCode.PartialFailure;
        });
      }
    }
  }).pipe(
    Effect.catchAll((exitCode) =>
      Effect.gen(function* () {
        if (typeof exitCode === "number") {
          yield* Effect.sync(() => {
            process.exitCode = exitCode;
          });
        }
      })
    )
  );

export const generateCommand = CliCommand.make(
  "generate",
  {
    package: packageOption,
    validateExamples: validateExamplesOption,
    parallel: parallelOption,
    json: jsonOption,
  },
  (args) =>
    handleGenerate({
      package: O.getOrUndefined(args.package),
      validateExamples: args.validateExamples,
      parallel: args.parallel,
      json: args.json,
    })
).pipe(CliCommand.withDescription("Run docgen for one or all configured packages"));
