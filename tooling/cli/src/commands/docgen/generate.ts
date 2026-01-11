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
 * @since 1.0.0
 * @see DOCGEN_CLI_IMPLEMENTATION.md#3-beep-docgen-generate
 */

import type * as FsUtils from "@beep/tooling-utils/FsUtils";
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
import * as P from "effect/Predicate";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { discoverConfiguredPackages, resolvePackageByPathOrName } from "./shared/discovery.js";
import { DocgenLogger, DocgenLoggerLive } from "./shared/logger.js";
import { blank, error, formatPackageResult, header, info, symbols, warning } from "./shared/output.js";
import type { GenerationResult, PackageInfo } from "./types.js";
import { ExitCode } from "./types.js";

// Options
const packageOption = CliOptions.optional(CliOptions.text("package")).pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target package (path or @beep/* name; default: all configured)")
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
 * Stream process output to the console.
 * Collects output while streaming it so we can return it for error messages.
 */
const streamProcessOutput = <E>(stream: Stream.Stream<Uint8Array, E, never>): Effect.Effect<string, E, never> =>
  Effect.gen(function* () {
    const decoder = new TextDecoder();
    const chunks: string[] = [];

    yield* Stream.runForEach(stream, (chunk) =>
      Effect.sync(() => {
        const text = decoder.decode(chunk);
        chunks.push(text);
        // Stream output to stderr so it appears immediately
        process.stderr.write(text);
      })
    );

    return chunks.join("");
  });

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

    // Run the command and stream output to console
    const result = yield* Effect.gen(function* () {
      const proc = yield* Command.start(command);

      // Stream stdout and stderr to console while collecting for error messages
      const [stdout, stderr] = yield* Effect.all([streamProcessOutput(proc.stdout), streamProcessOutput(proc.stderr)], {
        concurrency: 2,
      });

      const exitCode = yield* proc.exitCode;

      return { exitCode, stdout, stderr };
    }).pipe(
      Effect.scoped,
      Effect.catchAll(
        (e) => Effect.succeed({ exitCode: 1, stdout: "", stderr: String(e) }) // Treat any error as failure
      )
    );

    if (result.exitCode === 0) {
      // Count generated modules
      const docsPath = path.join(pkg.absolutePath, "docs", "modules");
      const docsExist = yield* fs.exists(docsPath).pipe(Effect.orElseSucceed(F.constFalse));

      let moduleCount: number | undefined = undefined;
      if (docsExist) {
        const files = yield* fs.readDirectory(docsPath).pipe(Effect.catchAll(() => Effect.succeed(A.empty<string>())));
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
      error: `docgen exited with code ${result.exitCode}`,
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
}): Effect.Effect<
  void,
  never,
  CommandExecutor.CommandExecutor | FileSystem.FileSystem | Path.Path | FsUtils.FsUtils | DocgenLogger
> =>
  Effect.gen(function* () {
    const logger = yield* DocgenLogger;

    yield* logger.info("Starting generate", {
      package: args.package ?? "all configured",
      validateExamples: args.validateExamples,
      parallel: args.parallel,
      json: args.json,
    });

    // Resolve target packages
    let packages: ReadonlyArray<PackageInfo>;

    if (args.package !== undefined) {
      // Single package mode
      const pkgInfo = yield* resolvePackageByPathOrName(args.package).pipe(
        Effect.tapError((e) =>
          logger.error("Invalid package", {
            path: e.path,
            error: e._tag,
            reason: P.isTagged("InvalidPackagePathError")(e) ? e.reason : (e.message ?? "not found"),
          })
        ),
        Effect.catchAll((e) =>
          Effect.gen(function* () {
            yield* error(
              `Invalid package: ${e.path} - ${P.isTagged("InvalidPackagePathError")(e) ? e.reason : (e.message ?? "not found")}`
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
          packages: A.empty<{
            readonly packageName: string;
            readonly packagePath: string;
            readonly success: boolean;
            readonly error?: undefined | string;
            readonly moduleCount?: undefined | number;
          }>(),
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

    yield* logger.debug("Found packages", {
      count: A.length(packages),
      packages: F.pipe(
        packages,
        A.map((p) => p.name)
      ),
    });

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

    yield* logger.info("Generation complete", {
      total: A.length(results),
      succeeded: successCount,
      failed: failureCount,
    });

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
        if (P.isNumber(exitCode)) {
          yield* Effect.sync(() => {
            process.exitCode = exitCode;
          });
        }
      })
    )
  );

/**
 * CLI command to generate API documentation using @effect/docgen.
 *
 * @example
 * ```ts
 * import { generateCommand } from "@beep/repo-cli/commands/docgen/generate"
 * import * as CliCommand from "@effect/cli/Command"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* CliCommand.run(generateCommand, {
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
    }).pipe(Effect.provide(DocgenLoggerLive()))
).pipe(CliCommand.withDescription("Run docgen for one or all configured packages"));
