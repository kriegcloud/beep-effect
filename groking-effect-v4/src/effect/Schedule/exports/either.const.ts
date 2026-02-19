/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: either
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting a tuple of the outputs of both schedules.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Either continues as long as at least one schedule wants to continue
 * const timeBasedSchedule = Schedule.spaced("2 seconds").pipe(Schedule.take(3))
 * const countBasedSchedule = Schedule.recurs(5)
 *
 * // Continues until both schedules are exhausted (either still wants to recur)
 * const eitherSchedule = Schedule.either(timeBasedSchedule, countBasedSchedule)
 * // Outputs: [time_result, count_result] tuple
 *
 * const program = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Task executed at ${new Date().toISOString()}`)
 *       return "task completed"
 *     }),
 *     eitherSchedule.pipe(
 *       Schedule.tapOutput(([timeResult, countResult]) =>
 *         Console.log(`Time: ${timeResult}, Count: ${countResult}`)
 *       )
 *     )
 *   )
 *
 *   yield* Console.log(`Total executions: ${results.length}`)
 * })
 *
 * // Either with different delay strategies
 * const aggressiveRetry = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3)
 * )
 * const fallbackRetry = Schedule.fixed("5 seconds").pipe(Schedule.take(2))
 *
 * // Will use the more aggressive retry until it's exhausted, then fallback
 * const combinedRetry = Schedule.either(aggressiveRetry, fallbackRetry)
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *
 *       if (attempt < 6) {
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     combinedRetry
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Either provides union semantics (OR logic)
 * // Compare with intersect which provides intersection semantics (AND logic)
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
const exportName = "either";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting a tuple of the out...";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Either continues as long as at least one schedule wants to continue\nconst timeBasedSchedule = Schedule.spaced("2 seconds").pipe(Schedule.take(3))\nconst countBasedSchedule = Schedule.recurs(5)\n\n// Continues until both schedules are exhausted (either still wants to recur)\nconst eitherSchedule = Schedule.either(timeBasedSchedule, countBasedSchedule)\n// Outputs: [time_result, count_result] tuple\n\nconst program = Effect.gen(function*() {\n  const results = yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(`Task executed at ${new Date().toISOString()}`)\n      return "task completed"\n    }),\n    eitherSchedule.pipe(\n      Schedule.tapOutput(([timeResult, countResult]) =>\n        Console.log(`Time: ${timeResult}, Count: ${countResult}`)\n      )\n    )\n  )\n\n  yield* Console.log(`Total executions: ${results.length}`)\n})\n\n// Either with different delay strategies\nconst aggressiveRetry = Schedule.exponential("100 millis").pipe(\n  Schedule.take(3)\n)\nconst fallbackRetry = Schedule.fixed("5 seconds").pipe(Schedule.take(2))\n\n// Will use the more aggressive retry until it\'s exhausted, then fallback\nconst combinedRetry = Schedule.either(aggressiveRetry, fallbackRetry)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Retry attempt ${attempt}`)\n\n      if (attempt < 6) {\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    combinedRetry\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Either provides union semantics (OR logic)\n// Compare with intersect which provides intersection semantics (AND logic)';
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
