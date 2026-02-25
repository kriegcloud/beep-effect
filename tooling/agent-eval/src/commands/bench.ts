/**
 * Bench command implementation.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path as PathService } from "effect";
import { Effect, FileSystem as FS, Path } from "effect";
import * as S from "effect/Schema";
import { loadTaskCatalog } from "../benchmark/catalog.js";
import { renderBenchmarkMarkdown } from "../benchmark/report.js";
import {
  type BenchmarkDiagnosticEvent,
  type BenchmarkProgressEvent,
  decodeCorrectionIndexJson,
  decodePricingTableJson,
  runBenchmarkSuite,
} from "../benchmark/runner.js";
import { AgentEvalConfigError, AgentEvalDecodeError } from "../errors.js";
import { readFileUtf8, writeFileUtf8 } from "../io.js";
import { loadPolicyOverlays } from "../policies/index.js";
import { type AgentBenchSuite, AgentBenchSuiteSchema, type AgentName, type BenchCondition } from "../schemas/index.js";

/**
 * Bench command arguments.
 *
 * @since 0.0.0
 * @category models
 */
export interface BenchArgs {
  readonly output: string;
  readonly reportOutput: string;
  readonly progressOutput: string;
  readonly diagnostics: boolean;
  readonly diagnosticsOutput: string;
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
  readonly conditions: ReadonlyArray<BenchCondition>;
  readonly agents: ReadonlyArray<AgentName>;
  readonly taskIds: ReadonlyArray<string>;
  readonly maxWallMinutes: number | undefined;
}

const decodeSuite = S.decodeUnknownSync(AgentBenchSuiteSchema);

const formatProgressLine = (event: BenchmarkProgressEvent): string => {
  if (event.type === "suite.started") {
    return `[bench] suite started plannedRuns=${event.plannedRunCount} strictTaskCount=${event.strictTaskCount}`;
  }
  if (event.type === "run.started") {
    return `[bench] run ${event.runIndex}/${event.totalRuns} started ${event.runId}`;
  }
  if (event.type === "run.completed") {
    return `[bench] run ${event.runIndex}/${event.totalRuns} completed ${event.runId} success=${event.success}`;
  }
  if (event.type === "suite.aborted") {
    return `[bench] suite aborted completedRuns=${event.completedRunCount}/${event.plannedRunCount} reason=${event.reason}`;
  }
  return `[bench] suite completed status=${event.status} completedRuns=${event.completedRunCount}/${event.plannedRunCount}`;
};

const formatDiagnosticLine = (event: BenchmarkDiagnosticEvent): string => {
  if (event.type === "suite.metrics") {
    return `[bench][diag] suite metrics status=${event.status} completedRuns=${event.completedRunCount}/${event.plannedRunCount} success=${event.outcomeCounts.success}`;
  }

  const failureType = event.result.failureType ?? "none";
  const firstViolationPath = event.allowlist.firstViolationPath ?? "none";
  return `[bench][diag] run ${event.runId} success=${event.result.success} failureType=${failureType} allowlistPass=${event.allowlist.pass} firstViolationPath=${firstViolationPath}`;
};

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
  if (args.conditions.length === 0) {
    return yield* Effect.fail(
      new AgentEvalConfigError({
        message: "No conditions selected. Provide at least one condition in --conditions.",
      })
    );
  }

  if (args.agents.length === 0) {
    return yield* Effect.fail(
      new AgentEvalConfigError({
        message: "No agents selected. Provide at least one agent in --agents.",
      })
    );
  }

  const selectedTasks = args.taskIds.length === 0 ? tasks : tasks.filter((task) => args.taskIds.includes(task.id));
  const missingTaskIds = args.taskIds.filter((taskId) => !tasks.some((task) => task.id === taskId));

  if (missingTaskIds.length > 0) {
    return yield* Effect.fail(
      new AgentEvalConfigError({
        message: `Unknown task IDs in --task-ids: ${missingTaskIds.join(", ")}`,
      })
    );
  }

  if (selectedTasks.length === 0) {
    return yield* Effect.fail(
      new AgentEvalConfigError({
        message: "Task filter resolved to zero tasks.",
      })
    );
  }

  const smokeTaskLimit = Math.max(1, args.smokeTaskLimit);
  const smokeTimeoutMinutes = Math.max(1, args.smokeTimeoutMinutes);
  const runTasks = args.smoke
    ? selectedTasks.slice(0, smokeTaskLimit).map((task) => ({
        ...task,
        timeoutMinutes: Math.min(task.timeoutMinutes, smokeTimeoutMinutes),
      }))
    : selectedTasks;
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

  const fs = yield* FS.FileSystem;
  const pathApi = yield* Path.Path;
  const repoRoot = pathApi.resolve(process.cwd());
  const progressOutputPath = pathApi.isAbsolute(args.progressOutput)
    ? args.progressOutput
    : pathApi.resolve(process.cwd(), args.progressOutput);
  const diagnosticsOutputPath = pathApi.isAbsolute(args.diagnosticsOutput)
    ? args.diagnosticsOutput
    : pathApi.resolve(process.cwd(), args.diagnosticsOutput);

  yield* fs.makeDirectory(pathApi.dirname(progressOutputPath), { recursive: true });
  yield* fs.writeFileString(progressOutputPath, "");
  if (args.diagnostics) {
    yield* fs.makeDirectory(pathApi.dirname(diagnosticsOutputPath), { recursive: true });
    yield* fs.writeFileString(diagnosticsOutputPath, "");
  }

  const progressEvents: Array<BenchmarkProgressEvent> = [];
  const diagnosticEvents: Array<BenchmarkDiagnosticEvent> = [];
  let progressFlushQueue: Promise<void> = Promise.resolve();
  let diagnosticsFlushQueue: Promise<void> = Promise.resolve();

  const flushProgressJsonl = (events: ReadonlyArray<BenchmarkProgressEvent>): Promise<void> => {
    const progressJsonl = events.map((event) => JSON.stringify(event)).join("\n");
    const content = progressJsonl.length === 0 ? "" : `${progressJsonl}\n`;
    return Effect.runPromise(fs.writeFileString(progressOutputPath, content));
  };

  const flushDiagnosticsJsonl = (events: ReadonlyArray<BenchmarkDiagnosticEvent>): Promise<void> => {
    const diagnosticsJsonl = events.map((event) => JSON.stringify(event)).join("\n");
    const content = diagnosticsJsonl.length === 0 ? "" : `${diagnosticsJsonl}\n`;
    return Effect.runPromise(fs.writeFileString(diagnosticsOutputPath, content));
  };

  const suite = yield* Effect.promise(() =>
    runBenchmarkSuite({
      tasks: runTasks,
      conditions: args.conditions,
      agents: args.agents,
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
      ...(args.maxWallMinutes === undefined ? {} : { maxWallMinutes: args.maxWallMinutes }),
      onProgress: (event) => {
        progressEvents.push(event);
        console.log(formatProgressLine(event));
        progressFlushQueue = progressFlushQueue
          .then(() => flushProgressJsonl(progressEvents))
          .catch(() => Promise.resolve());
        return progressFlushQueue;
      },
      ...(args.diagnostics
        ? {
            onDiagnostic: (event: BenchmarkDiagnosticEvent) => {
              diagnosticEvents.push(event);
              console.log(formatDiagnosticLine(event));
              diagnosticsFlushQueue = diagnosticsFlushQueue
                .then(() => flushDiagnosticsJsonl(diagnosticEvents))
                .catch(() => Promise.resolve());
              return diagnosticsFlushQueue;
            },
          }
        : {}),
    })
  );

  yield* Effect.promise(() => progressFlushQueue);
  if (args.diagnostics) {
    yield* Effect.promise(() => diagnosticsFlushQueue);
  }

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
  yield* Effect.promise(() => flushProgressJsonl(progressEvents));
  if (args.diagnostics) {
    yield* Effect.promise(() => flushDiagnosticsJsonl(diagnosticEvents));
  }

  if (validatedSuite.status === "aborted_wall_cap") {
    return yield* Effect.fail(
      new AgentEvalConfigError({
        message: validatedSuite.abortReason ?? "Benchmark suite aborted due max wall clock cap.",
      })
    );
  }

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
