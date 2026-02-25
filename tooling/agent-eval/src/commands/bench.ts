/**
 * Bench command implementation.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path as PathService } from "effect";
import { Effect, Path } from "effect";
import * as S from "effect/Schema";
import { loadTaskCatalog } from "../benchmark/catalog.js";
import { renderBenchmarkMarkdown } from "../benchmark/report.js";
import { decodeCorrectionIndexJson, decodePricingTableJson, runBenchmarkSuite } from "../benchmark/runner.js";
import { AgentEvalDecodeError } from "../errors.js";
import { readFileUtf8, writeFileUtf8 } from "../io.js";
import { loadPolicyOverlays } from "../policies/index.js";
import { type AgentBenchSuite, AgentBenchSuiteSchema } from "../schemas/index.js";

/**
 * Bench command arguments.
 *
 * @since 0.0.0
 * @category models
 */
export interface BenchArgs {
  readonly output: string;
  readonly reportOutput: string;
  readonly taskDirectory: string;
  readonly strictTaskCount: number;
  readonly smoke: boolean;
  readonly smokeTaskLimit: number;
  readonly smokeTimeoutMinutes: number;
  readonly policyDirectory: string;
  readonly correctionIndexFile: string;
  readonly pricingFile: string;
  readonly simulate: boolean;
  readonly trials: number;
  readonly graphitiUrl: string;
  readonly graphitiGroupId: string;
  readonly isolateInWorktree: boolean;
}

const decodeSuite = S.decodeUnknownSync(AgentBenchSuiteSchema);

/**
 * Execute benchmark run and persist JSON + markdown artifacts.
 *
 * @since 0.0.0
 * @category commands
 */
export const handleBench: (
  args: BenchArgs
) => Effect.Effect<AgentBenchSuite, unknown, FileSystem.FileSystem | PathService.Path> = Effect.fn(function* (args) {
  const tasks = yield* loadTaskCatalog(args.taskDirectory, args.strictTaskCount);
  const smokeTaskLimit = Math.max(1, args.smokeTaskLimit);
  const smokeTimeoutMinutes = Math.max(1, args.smokeTimeoutMinutes);
  const runTasks = args.smoke
    ? tasks.slice(0, smokeTaskLimit).map((task) => ({
        ...task,
        timeoutMinutes: Math.min(task.timeoutMinutes, smokeTimeoutMinutes),
      }))
    : tasks;
  const runStrictTaskCount = args.smoke ? runTasks.length : args.strictTaskCount;
  const overlays = yield* loadPolicyOverlays(args.policyDirectory);

  const correctionIndexContent = yield* readFileUtf8(args.correctionIndexFile);
  const correctionIndex = yield* Effect.try({
    try: () => decodeCorrectionIndexJson(correctionIndexContent),
    catch: (cause) =>
      new AgentEvalDecodeError({
        source: args.correctionIndexFile,
        message: `Invalid correction index: ${args.correctionIndexFile}`,
        cause,
      }),
  });

  const pricingContent = yield* readFileUtf8(args.pricingFile);
  const pricingTable = yield* Effect.try({
    try: () => decodePricingTableJson(pricingContent),
    catch: (cause) =>
      new AgentEvalDecodeError({
        source: args.pricingFile,
        message: `Invalid pricing map: ${args.pricingFile}`,
        cause,
      }),
  });

  const pathApi = yield* Path.Path;
  const repoRoot = pathApi.resolve(process.cwd());

  const suite = yield* Effect.promise(() =>
    runBenchmarkSuite({
      tasks: runTasks,
      conditions: ["current", "minimal", "adaptive", "adaptive_kg"],
      agents: ["codex", "claude"],
      trials: args.trials,
      simulate: args.simulate,
      repoRoot,
      pathApi,
      policyOverlays: overlays,
      correctionIndex,
      pricingTable,
      graphiti: {
        url: args.graphitiUrl,
        groupId: args.graphitiGroupId,
      },
      strictTaskCount: runStrictTaskCount,
      isolateInWorktree: args.isolateInWorktree,
    })
  );

  const validatedSuite = yield* Effect.try({
    try: () => decodeSuite(suite),
    catch: (cause) =>
      new AgentEvalDecodeError({
        source: args.output,
        message: `Invalid suite payload for output: ${args.output}`,
        cause,
      }),
  });

  yield* writeFileUtf8(args.output, `${JSON.stringify(validatedSuite, null, 2)}\n`);

  const report = renderBenchmarkMarkdown(validatedSuite, "Agent Reliability Benchmark Report");
  yield* writeFileUtf8(args.reportOutput, report);

  return validatedSuite;
});

/**
 * Read one benchmark suite from JSON file.
 *
 * @since 0.0.0
 * @category commands
 */
export const readSuiteFile: (
  filePath: string
) => Effect.Effect<AgentBenchSuite, unknown, FileSystem.FileSystem | PathService.Path> = Effect.fn(
  function* (filePath) {
    const content = yield* readFileUtf8(filePath);
    const decode = S.decodeUnknownSync(S.fromJsonString(AgentBenchSuiteSchema));
    return yield* Effect.try({
      try: () => decode(content),
      catch: (cause) =>
        new AgentEvalDecodeError({
          source: filePath,
          message: `Invalid suite file ${filePath}`,
          cause,
        }),
    });
  }
);
