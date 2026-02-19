/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: during
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * Returns a new `Schedule` that will always recur, but only during the specified `duration` of time.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Run a task for exactly 5 seconds, regardless of how many iterations
 * const fiveSecondSchedule = Schedule.during("5 seconds")
 *
 * const timedProgram = Effect.gen(function*() {
 *   const startTime = Date.now()
 *
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const elapsed = Date.now() - startTime
 *       yield* Console.log(`Task executed after ${elapsed}ms`)
 *       yield* Effect.sleep("500 millis") // Each task takes 500ms
 *       return "task done"
 *     }),
 *     fiveSecondSchedule.pipe(
 *       Schedule.tapOutput((elapsedDuration) =>
 *         Console.log(`Total elapsed: ${elapsedDuration}`)
 *       )
 *     )
 *   )
 *
 *   yield* Console.log("Time limit reached!")
 * })
 *
 * // Combine with other schedules for time-bounded execution
 * const timeAndCountLimited = Schedule.spaced("1 second").pipe(
 *   Schedule.both(Schedule.during("10 seconds")), // Stop after 10 seconds OR
 *   Schedule.both(Schedule.recurs(15)) // 15 attempts, whichever comes first
 * )
 *
 * // Burst execution within time window
 * const burstWindow = Schedule.during("3 seconds")
 *
 * const burstProgram = Effect.gen(function*() {
 *   yield* Console.log("Starting burst execution...")
 *
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Burst task at ${new Date().toISOString()}`)
 *       return Math.random()
 *     }),
 *     burstWindow
 *   )
 *
 *   yield* Console.log("Burst window completed")
 * })
 *
 * // Timed retry window - retry for up to 30 seconds
 * const timedRetry = Schedule.exponential("200 millis").pipe(
 *   Schedule.both(Schedule.during("30 seconds"))
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *
 *       if (Math.random() < 0.8) { // 80% failure rate
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     timedRetry
 *   )
 *
 *   yield* Console.log(`Result: ${result}`)
 * }).pipe(
 *   Effect.catch((error: unknown) => Console.log(`Timed out: ${String(error)}`))
 * )
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
const exportName = "during";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that will always recur, but only during the specified `duration` of time.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Run a task for exactly 5 seconds, regardless of how many iterations\nconst fiveSecondSchedule = Schedule.during("5 seconds")\n\nconst timedProgram = Effect.gen(function*() {\n  const startTime = Date.now()\n\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      const elapsed = Date.now() - startTime\n      yield* Console.log(`Task executed after ${elapsed}ms`)\n      yield* Effect.sleep("500 millis") // Each task takes 500ms\n      return "task done"\n    }),\n    fiveSecondSchedule.pipe(\n      Schedule.tapOutput((elapsedDuration) =>\n        Console.log(`Total elapsed: ${elapsedDuration}`)\n      )\n    )\n  )\n\n  yield* Console.log("Time limit reached!")\n})\n\n// Combine with other schedules for time-bounded execution\nconst timeAndCountLimited = Schedule.spaced("1 second").pipe(\n  Schedule.both(Schedule.during("10 seconds")), // Stop after 10 seconds OR\n  Schedule.both(Schedule.recurs(15)) // 15 attempts, whichever comes first\n)\n\n// Burst execution within time window\nconst burstWindow = Schedule.during("3 seconds")\n\nconst burstProgram = Effect.gen(function*() {\n  yield* Console.log("Starting burst execution...")\n\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(`Burst task at ${new Date().toISOString()}`)\n      return Math.random()\n    }),\n    burstWindow\n  )\n\n  yield* Console.log("Burst window completed")\n})\n\n// Timed retry window - retry for up to 30 seconds\nconst timedRetry = Schedule.exponential("200 millis").pipe(\n  Schedule.both(Schedule.during("30 seconds"))\n)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Retry attempt ${attempt}`)\n\n      if (Math.random() < 0.8) { // 80% failure rate\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    timedRetry\n  )\n\n  yield* Console.log(`Result: ${result}`)\n}).pipe(\n  Effect.catch((error: unknown) => Console.log(`Timed out: ${String(error)}`))\n)';
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
