/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: addDelay
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Returns a new `Schedule` that adds the delay computed by the specified effectful function to the the next recurrence of the schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect, Schedule } from "effect"
 *
 * // Add random jitter to schedule delays
 * const jitteredSchedule = Schedule.addDelay(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(5)),
 *   (output) =>
 *     // Add random jitter between 0-50ms
 *     Effect.succeed(Duration.millis(Math.random() * 50))
 * )
 *
 * const jitterProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Task executed at ${new Date().toISOString()}`)
 *       return "jittered task"
 *     }),
 *     jitteredSchedule.pipe(
 *       Schedule.tapOutput((delay) =>
 *         Console.log(`Base delay with jitter applied`)
 *       )
 *     )
 *   )
 * })
 *
 * // Add adaptive delay based on execution count
 * const adaptiveSchedule = Schedule.addDelay(
 *   Schedule.recurs(6),
 *   (executionCount) =>
 *     // Increase delay as execution count grows
 *     Effect.succeed(Duration.millis(executionCount * 200))
 * )
 *
 * const adaptiveProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Adaptive delay task")
 *       return "adaptive"
 *     }),
 *     adaptiveSchedule.pipe(
 *       Schedule.tapOutput((count) =>
 *         Console.log(`Execution ${count + 1} with adaptive delay`)
 *       )
 *     )
 *   )
 * })
 *
 * // Add effectful delay computation
 * const dynamicSchedule = Schedule.addDelay(
 *   Schedule.spaced("1 second").pipe(Schedule.take(4)),
 *   (executionNumber) =>
 *     // Simulate checking system load and return additional delay
 *     Effect.succeed(Duration.millis(Math.random() > 0.7 ? 2000 : 500))
 * )
 *
 * const dynamicProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Dynamic delay task")
 *       return "dynamic"
 *     }),
 *     dynamicSchedule
 *   )
 * })
 *
 * // Add delay based on previous execution results (30% extra)
 * const resultBasedSchedule = Schedule.addDelay(
 *   Schedule.fibonacci("200 millis").pipe(Schedule.take(5)),
 *   (fibonacciDelay) =>
 *     Effect.succeed(Duration.millis(Duration.toMillis(fibonacciDelay) * 0.3))
 * )
 *
 * const resultProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Result-based delay task")
 *       return Math.random()
 *     }),
 *     resultBasedSchedule.pipe(
 *       Schedule.tapOutput((delay) => Console.log(`Fibonacci delay: ${delay}`))
 *     )
 *   )
 * })
 *
 * // Combine with retry for progressive backoff
 * const progressiveRetrySchedule = Schedule.addDelay(
 *   Schedule.exponential("50 millis").pipe(Schedule.take(4)),
 *   () => Effect.succeed(Duration.millis(100)) // Fixed additional delay
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 5) {
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     progressiveRetrySchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
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
const exportName = "addDelay";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that adds the delay computed by the specified effectful function to the the next recurrence of the schedule.";
const sourceExample =
  'import { Console, Duration, Effect, Schedule } from "effect"\n\n// Add random jitter to schedule delays\nconst jitteredSchedule = Schedule.addDelay(\n  Schedule.exponential("100 millis").pipe(Schedule.take(5)),\n  (output) =>\n    // Add random jitter between 0-50ms\n    Effect.succeed(Duration.millis(Math.random() * 50))\n)\n\nconst jitterProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(`Task executed at ${new Date().toISOString()}`)\n      return "jittered task"\n    }),\n    jitteredSchedule.pipe(\n      Schedule.tapOutput((delay) =>\n        Console.log(`Base delay with jitter applied`)\n      )\n    )\n  )\n})\n\n// Add adaptive delay based on execution count\nconst adaptiveSchedule = Schedule.addDelay(\n  Schedule.recurs(6),\n  (executionCount) =>\n    // Increase delay as execution count grows\n    Effect.succeed(Duration.millis(executionCount * 200))\n)\n\nconst adaptiveProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Adaptive delay task")\n      return "adaptive"\n    }),\n    adaptiveSchedule.pipe(\n      Schedule.tapOutput((count) =>\n        Console.log(`Execution ${count + 1} with adaptive delay`)\n      )\n    )\n  )\n})\n\n// Add effectful delay computation\nconst dynamicSchedule = Schedule.addDelay(\n  Schedule.spaced("1 second").pipe(Schedule.take(4)),\n  (executionNumber) =>\n    // Simulate checking system load and return additional delay\n    Effect.succeed(Duration.millis(Math.random() > 0.7 ? 2000 : 500))\n)\n\nconst dynamicProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Dynamic delay task")\n      return "dynamic"\n    }),\n    dynamicSchedule\n  )\n})\n\n// Add delay based on previous execution results (30% extra)\nconst resultBasedSchedule = Schedule.addDelay(\n  Schedule.fibonacci("200 millis").pipe(Schedule.take(5)),\n  (fibonacciDelay) =>\n    Effect.succeed(Duration.millis(Duration.toMillis(fibonacciDelay) * 0.3))\n)\n\nconst resultProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Result-based delay task")\n      return Math.random()\n    }),\n    resultBasedSchedule.pipe(\n      Schedule.tapOutput((delay) => Console.log(`Fibonacci delay: ${delay}`))\n    )\n  )\n})\n\n// Combine with retry for progressive backoff\nconst progressiveRetrySchedule = Schedule.addDelay(\n  Schedule.exponential("50 millis").pipe(Schedule.take(4)),\n  () => Effect.succeed(Duration.millis(100)) // Fixed additional delay\n)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      if (attempt < 5) {\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n      return `Success on attempt ${attempt}`\n    }),\n    progressiveRetrySchedule\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})';
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
