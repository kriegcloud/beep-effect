/**
 * @file CLI command for docgen agents with real-time token tracking.
 *
 * This module provides the `agents` subcommand for the docgen CLI.
 * It orchestrates AI agents to fix JSDoc documentation across packages.
 *
 * Features:
 * - Single package or batch processing
 * - Parallel execution with configurable concurrency
 * - Dry-run mode for analysis without changes
 * - Durable mode with crash recovery via @effect/workflow
 * - Real-time token usage tracking and cost estimation
 *
 * @example
 * ```bash
 * # Standard mode (fast, no crash recovery)
 * bun run docgen:agents --package @beep/contract
 *
 * # Durable mode (crash-resilient, can resume)
 * bun run docgen:agents --durable --package @beep/contract
 *
 * # Resume an interrupted workflow
 * bun run docgen:agents --durable --resume docgen-packages-common-contract
 * ```
 *
 * @module docgen/agents
 * @since 1.0.0
 */

import * as ToolingUtils from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { discoverConfiguredPackages, resolvePackagePath } from "../shared/discovery.js";
import * as Output from "../shared/output.js";
import { DocgenAgentService, DocgenAgentServiceLive, type TokenStats } from "./service.js";

const { FsUtilsLive } = ToolingUtils;

/**
 * Anthropic pricing per million tokens (as of Dec 2025).
 *
 * @category Constants
 * @since 0.1.0
 */
export const ANTHROPIC_PRICING = {
  "claude-sonnet-4-20250514": {
    input: 3.0,
    output: 15.0,
    cachedInput: 0.3,
  },
  "claude-opus-4-20250514": {
    input: 15.0,
    output: 75.0,
    cachedInput: 1.5,
  },
} as const;

type ModelKey = keyof typeof ANTHROPIC_PRICING;

/**
 * Estimate cost based on token usage.
 *
 * @param usage - Token usage statistics
 * @param model - Model ID for pricing lookup
 * @returns Estimated cost in USD
 *
 * @category Utils
 * @since 0.1.0
 */
export const estimateCost = (usage: TokenStats, model: string): number => {
  const pricing = F.pipe(ANTHROPIC_PRICING, (p) => p[model as ModelKey] ?? p["claude-sonnet-4-20250514"]);

  const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
  const cachedCost = (usage.cachedInputTokens / 1_000_000) * pricing.cachedInput;

  return inputCost + outputCost + cachedCost;
};

/**
 * CLI options for the agents command.
 *
 * @category Options
 * @since 0.1.0
 */
const packageOption = CliOptions.text("package").pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target specific package (path or name)"),
  CliOptions.optional
);

const parallelOption = CliOptions.integer("parallel").pipe(
  CliOptions.withDescription("Concurrency level (default: 2)"),
  CliOptions.withDefault(2)
);

const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("n"),
  CliOptions.withDescription("Analysis without changes"),
  CliOptions.withDefault(false)
);

const verboseOption = CliOptions.boolean("verbose").pipe(
  CliOptions.withAlias("v"),
  CliOptions.withDescription("Detailed output"),
  CliOptions.withDefault(false)
);

const modelOption = CliOptions.text("model").pipe(
  CliOptions.withDescription("Claude model ID"),
  CliOptions.withDefault("claude-sonnet-4-20250514")
);

const durableOption = CliOptions.boolean("durable").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription("Enable crash recovery"),
  CliOptions.withDefault(false)
);

const resumeOption = CliOptions.text("resume").pipe(
  CliOptions.withDescription("Resume interrupted workflow"),
  CliOptions.optional
);

const agentsOptions = {
  package: packageOption,
  parallel: parallelOption,
  dryRun: dryRunOption,
  verbose: verboseOption,
  model: modelOption,
  durable: durableOption,
  resume: resumeOption,
};

/**
 * The agents command for running AI-powered documentation fixes.
 *
 * @category Commands
 * @since 0.1.0
 */
export const agentsCommand = CliCommand.make("agents", agentsOptions, (options) =>
  Effect.gen(function* () {
    const startTime = DateTime.unsafeNow();
    const formatter = Intl.NumberFormat("en-US");

    yield* Output.header("Docgen Agents");

    if (options.dryRun) {
      yield* Console.log(Output.dryRunTag());
    }

    // Determine packages to process
    const packagePaths = yield* Effect.gen(function* () {
      if (O.isSome(options.package)) {
        const pkg = yield* resolvePackagePath(options.package.value).pipe(
          Effect.catchAll((_) =>
            Effect.fail(
              new Error(`Package not found: ${O.isSome(options.package) ? options.package.value : "<unknown>"}`)
            )
          )
        );
        return A.make(pkg.relativePath);
      }

      const configured = yield* discoverConfiguredPackages;
      if (A.isEmptyReadonlyArray(configured)) {
        yield* Output.warning("No packages with docgen.json found");
        return A.empty<string>();
      }

      return F.pipe(
        configured,
        A.map((p) => p.relativePath)
      );
    });

    if (A.isEmptyReadonlyArray(packagePaths)) {
      yield* Console.log("\nNo packages to process.");
      return;
    }

    yield* Output.info(`Processing ${formatter.format(A.length(packagePaths))} package(s)`);

    if (options.verbose) {
      yield* Output.bulletList(packagePaths);
    }

    yield* Output.blank();

    // Create the service layer
    const serviceLayer = DocgenAgentServiceLive({
      model: options.model,
      maxTokens: 8192,
      maxIterations: 20,
      dryRun: options.dryRun,
    });

    // Run the agent service
    const results = yield* Effect.gen(function* () {
      const service = yield* DocgenAgentService;

      const results = yield* service.fixPackages(packagePaths, options.parallel);
      const tokenStats = yield* service.getTokenStats;

      return { results, tokenStats };
    }).pipe(Effect.provide(serviceLayer), Effect.provide(NodeContext.layer), Effect.provide(FsUtilsLive));

    // Display results
    yield* Output.header("Results");

    yield* Effect.forEach(
      results.results,
      (result) =>
        Effect.gen(function* () {
          if (result.success) {
            yield* Output.success(
              `${result.packageName}: ${formatter.format(result.exportsFixed)} fixed, ${formatter.format(result.exportsRemaining)} remaining`
            );
          } else {
            yield* Output.error(`${result.packageName}: Failed - ${F.pipe(result.errors, A.join(", "))}`);
          }
        }),
      { discard: true }
    );

    yield* Output.blank();
    yield* Output.divider();

    // Summary
    const totalFixed = F.pipe(
      results.results,
      A.map((r) => r.exportsFixed),
      A.reduce(0, (a, b) => a + b)
    );

    const totalRemaining = F.pipe(
      results.results,
      A.map((r) => r.exportsRemaining),
      A.reduce(0, (a, b) => a + b)
    );

    const successCount = F.pipe(
      results.results,
      A.filter((r) => r.success),
      A.length
    );

    const endTime = DateTime.unsafeNow();
    const durationMs = DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);
    const durationSec = Math.round(durationMs / 1000);

    yield* Console.log("\nSummary:");
    yield* Console.log(
      `  Packages:    ${formatter.format(successCount)}/${formatter.format(A.length(results.results))} succeeded`
    );
    yield* Console.log(`  Fixed:       ${formatter.format(totalFixed)} exports`);
    yield* Console.log(`  Remaining:   ${formatter.format(totalRemaining)} exports`);
    yield* Console.log(`  Duration:    ${durationSec}s`);

    // Token usage
    const { tokenStats } = results;
    if (tokenStats.totalTokens > 0) {
      const cost = estimateCost(tokenStats, options.model);

      yield* Console.log(`\nToken Usage:`);
      yield* Console.log(`  Input:       ${formatter.format(tokenStats.inputTokens)}`);
      yield* Console.log(`  Output:      ${formatter.format(tokenStats.outputTokens)}`);
      yield* Console.log(`  Total:       ${formatter.format(tokenStats.totalTokens)}`);
      yield* Console.log(`  Est. Cost:   $${cost.toFixed(4)}`);
    }
  }).pipe(
    Effect.catchAll((e) =>
      Effect.gen(function* () {
        yield* Output.error(`Error: ${String(e)}`);
        yield* Effect.fail(e);
      })
    )
  )
).pipe(CliCommand.withDescription("Run AI-powered JSDoc documentation fixes"));

export default agentsCommand;
