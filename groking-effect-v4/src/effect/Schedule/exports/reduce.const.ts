/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Returns a new `Schedule` that combines the outputs of the provided schedule using the specified effectful `combine` function and starting from the specified `initial` state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Sum up execution counts from a counter schedule
 * const sumSchedule = Schedule.reduce(
 *   Schedule.recurs(5),
 *   () => 0, // Initial sum
 *   (sum, count) => Effect.succeed(sum + count) // Add each count to the sum
 * )
 *
 * const sumProgram = Effect.gen(function*() {
 *   const finalSum = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task"
 *     }),
 *     sumSchedule.pipe(
 *       Schedule.tapOutput((sum) => Console.log(`Running sum: ${sum}`))
 *     )
 *   )
 *
 *   yield* Console.log(`Final sum: ${finalSum}`)
 * })
 *
 * // Build a history of execution times
 * const historySchedule = Schedule.reduce(
 *   Schedule.spaced("1 second").pipe(Schedule.take(4)),
 *   () => [] as Array<number>, // Initial empty array
 *   (history, executionNumber) => Effect.succeed([...history, Date.now()])
 * )
 *
 * const historyProgram = Effect.gen(function*() {
 *   const timeline = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Recording timestamp...")
 *       return "recorded"
 *     }),
 *     historySchedule
 *   )
 *
 *   yield* Console.log(
 *     `Execution timeline: ${timeline.length} timestamps recorded`
 *   )
 * })
 *
 * // Accumulate metrics with effectful combination
 * const metricsAccumulator = Schedule.reduce(
 *   Schedule.recurs(6),
 *   () => ({ total: 0, count: 0, max: 0 }),
 *   (metrics, executionCount) => Effect.succeed({
 *     total: metrics.total + executionCount + 1,
 *     count: metrics.count + 1,
 *     max: Math.max(metrics.max, executionCount + 1)
 *   })
 * )
 *
 * const metricsProgram = Effect.gen(function*() {
 *   const finalMetrics = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Processing...")
 *       return "processed"
 *     }),
 *     metricsAccumulator
 *   )
 *
 *   const average = finalMetrics.total / finalMetrics.count
 *   yield* Console.log(`Final metrics: ${finalMetrics.count} executions`)
 *   yield* Console.log(
 *     `Average delay: ${average.toFixed(1)}ms, Max delay: ${finalMetrics.max}ms`
 *   )
 * })
 *
 * // Build configuration state over time
 * const configBuilder = Schedule.reduce(
 *   Schedule.fixed("500 millis").pipe(Schedule.take(3)),
 *   () => ({ retries: 1, timeout: 1000, backoff: 100 }),
 *   (config, executionNumber) => Effect.succeed({
 *     retries: config.retries + 1,
 *     timeout: config.timeout * 1.5,
 *     backoff: Math.min(config.backoff * 2, 5000)
 *   })
 * )
 *
 * const configProgram = Effect.gen(function*() {
 *   const finalConfig = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Updating configuration...")
 *       return "updated"
 *     }),
 *     configBuilder.pipe(
 *       Schedule.tapOutput((config) =>
 *         Console.log(
 *           `Config: retries=${config.retries}, timeout=${config.timeout}ms`
 *         )
 *       )
 *     )
 *   )
 *
 *   yield* Console.log(`Final config: ${JSON.stringify(finalConfig)}`)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that combines the outputs of the provided schedule using the specified effectful `combine` function and starting from the specified `initial` state.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Sum up execution counts from a counter schedule\nconst sumSchedule = Schedule.reduce(\n  Schedule.recurs(5),\n  () => 0, // Initial sum\n  (sum, count) => Effect.succeed(sum + count) // Add each count to the sum\n)\n\nconst sumProgram = Effect.gen(function*() {\n  const finalSum = yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Task executed")\n      return "task"\n    }),\n    sumSchedule.pipe(\n      Schedule.tapOutput((sum) => Console.log(`Running sum: ${sum}`))\n    )\n  )\n\n  yield* Console.log(`Final sum: ${finalSum}`)\n})\n\n// Build a history of execution times\nconst historySchedule = Schedule.reduce(\n  Schedule.spaced("1 second").pipe(Schedule.take(4)),\n  () => [] as Array<number>, // Initial empty array\n  (history, executionNumber) => Effect.succeed([...history, Date.now()])\n)\n\nconst historyProgram = Effect.gen(function*() {\n  const timeline = yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Recording timestamp...")\n      return "recorded"\n    }),\n    historySchedule\n  )\n\n  yield* Console.log(\n    `Execution timeline: ${timeline.length} timestamps recorded`\n  )\n})\n\n// Accumulate metrics with effectful combination\nconst metricsAccumulator = Schedule.reduce(\n  Schedule.recurs(6),\n  () => ({ total: 0, count: 0, max: 0 }),\n  (metrics, executionCount) => Effect.succeed({\n    total: metrics.total + executionCount + 1,\n    count: metrics.count + 1,\n    max: Math.max(metrics.max, executionCount + 1)\n  })\n)\n\nconst metricsProgram = Effect.gen(function*() {\n  const finalMetrics = yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Processing...")\n      return "processed"\n    }),\n    metricsAccumulator\n  )\n\n  const average = finalMetrics.total / finalMetrics.count\n  yield* Console.log(`Final metrics: ${finalMetrics.count} executions`)\n  yield* Console.log(\n    `Average delay: ${average.toFixed(1)}ms, Max delay: ${finalMetrics.max}ms`\n  )\n})\n\n// Build configuration state over time\nconst configBuilder = Schedule.reduce(\n  Schedule.fixed("500 millis").pipe(Schedule.take(3)),\n  () => ({ retries: 1, timeout: 1000, backoff: 100 }),\n  (config, executionNumber) => Effect.succeed({\n    retries: config.retries + 1,\n    timeout: config.timeout * 1.5,\n    backoff: Math.min(config.backoff * 2, 5000)\n  })\n)\n\nconst configProgram = Effect.gen(function*() {\n  const finalConfig = yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Updating configuration...")\n      return "updated"\n    }),\n    configBuilder.pipe(\n      Schedule.tapOutput((config) =>\n        Console.log(\n          `Config: retries=${config.retries}, timeout=${config.timeout}ms`\n        )\n      )\n    )\n  )\n\n  yield* Console.log(`Final config: ${JSON.stringify(finalConfig)}`)\n})';
const moduleRecord = ScheduleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
