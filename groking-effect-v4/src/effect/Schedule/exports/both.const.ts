/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: both
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting a tuple of the outputs of both schedules.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Both schedules must want to continue for the combined schedule to continue
 * const timeLimit = Schedule.spaced("1 second").pipe(Schedule.take(5)) // max 5 times
 * const attemptLimit = Schedule.recurs(3) // max 3 attempts
 *
 * // Continues only while BOTH schedules want to continue (intersection/AND logic)
 * const bothSchedule = Schedule.both(timeLimit, attemptLimit)
 * // Outputs: [time_result, attempt_count] tuple
 *
 * const program = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Task executed at ${new Date().toISOString()}`)
 *       return "task completed"
 *     }),
 *     bothSchedule.pipe(
 *       Schedule.tapOutput(([timeResult, attemptResult]) =>
 *         Console.log(`Time: ${timeResult}, Attempts: ${attemptResult}`)
 *       )
 *     )
 *   )
 *
 *   yield* Console.log("Completed all executions")
 * })
 *
 * // Both with different delay strategies - uses maximum delay
 * const fastSchedule = Schedule.fixed("500 millis").pipe(Schedule.take(4))
 * const slowSchedule = Schedule.spaced("2 seconds").pipe(Schedule.take(6))
 *
 * // Will use the slower (maximum) delay and stop when first schedule exhausts
 * const conservativeSchedule = Schedule.both(fastSchedule, slowSchedule)
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *
 *       if (attempt < 3) {
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     conservativeSchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Both provides intersection semantics (AND logic)
 * // Compare with either which provides union semantics (OR logic)
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
const exportName = "both";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting a tuple of the output...";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Both schedules must want to continue for the combined schedule to continue\nconst timeLimit = Schedule.spaced("1 second").pipe(Schedule.take(5)) // max 5 times\nconst attemptLimit = Schedule.recurs(3) // max 3 attempts\n\n// Continues only while BOTH schedules want to continue (intersection/AND logic)\nconst bothSchedule = Schedule.both(timeLimit, attemptLimit)\n// Outputs: [time_result, attempt_count] tuple\n\nconst program = Effect.gen(function*() {\n  const results = yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(`Task executed at ${new Date().toISOString()}`)\n      return "task completed"\n    }),\n    bothSchedule.pipe(\n      Schedule.tapOutput(([timeResult, attemptResult]) =>\n        Console.log(`Time: ${timeResult}, Attempts: ${attemptResult}`)\n      )\n    )\n  )\n\n  yield* Console.log("Completed all executions")\n})\n\n// Both with different delay strategies - uses maximum delay\nconst fastSchedule = Schedule.fixed("500 millis").pipe(Schedule.take(4))\nconst slowSchedule = Schedule.spaced("2 seconds").pipe(Schedule.take(6))\n\n// Will use the slower (maximum) delay and stop when first schedule exhausts\nconst conservativeSchedule = Schedule.both(fastSchedule, slowSchedule)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Retry attempt ${attempt}`)\n\n      if (attempt < 3) {\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    conservativeSchedule\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Both provides intersection semantics (AND logic)\n// Compare with either which provides union semantics (OR logic)';
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
