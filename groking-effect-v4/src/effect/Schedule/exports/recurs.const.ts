/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: recurs
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Returns a `Schedule` which can only be stepped the specified number of `times` before it terminates.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Basic recurs - retry at most 3 times
 * const maxThreeAttempts = Schedule.recurs(3)
 *
 * // Retry a failing operation at most 5 times
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 *
 *       if (attempt < 4) {
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     Schedule.recurs(5) // Will retry up to 5 times
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Combining recurs with other schedules for sophisticated retry logic
 * const complexRetry = Schedule.exponential("100 millis").pipe(
 *   Schedule.compose(Schedule.recurs(3)) // At most 3 attempts
 * )
 *
 * // Repeat an effect exactly 10 times
 * const exactlyTenTimes = Effect.gen(function*() {
 *   yield* Console.log("Executing task...")
 *   return Math.random()
 * }).pipe(
 *   Effect.repeat(Schedule.recurs(10))
 * )
 *
 * // The schedule outputs the current recurrence count (0-based)
 * const countingSchedule = Schedule.recurs(3).pipe(
 *   Schedule.tapOutput((count) => Console.log(`Execution #${count + 1}`))
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
const exportName = "recurs";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a `Schedule` which can only be stepped the specified number of `times` before it terminates.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Basic recurs - retry at most 3 times\nconst maxThreeAttempts = Schedule.recurs(3)\n\n// Retry a failing operation at most 5 times\nconst program = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Attempt ${attempt}`)\n\n      if (attempt < 4) {\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    Schedule.recurs(5) // Will retry up to 5 times\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Combining recurs with other schedules for sophisticated retry logic\nconst complexRetry = Schedule.exponential("100 millis").pipe(\n  Schedule.compose(Schedule.recurs(3)) // At most 3 attempts\n)\n\n// Repeat an effect exactly 10 times\nconst exactlyTenTimes = Effect.gen(function*() {\n  yield* Console.log("Executing task...")\n  return Math.random()\n}).pipe(\n  Effect.repeat(Schedule.recurs(10))\n)\n\n// The schedule outputs the current recurrence count (0-based)\nconst countingSchedule = Schedule.recurs(3).pipe(\n  Schedule.tapOutput((count) => Console.log(`Execution #${count + 1}`))\n)';
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
