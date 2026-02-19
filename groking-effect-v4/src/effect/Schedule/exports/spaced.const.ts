/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: spaced
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:50:39.068Z
 *
 * Overview:
 * Returns a schedule that recurs continuously, each repetition spaced the specified duration from the last run.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Basic spaced schedule - runs every 2 seconds
 * const everyTwoSeconds = Schedule.spaced("2 seconds")
 *
 * // Heartbeat that runs indefinitely with fixed spacing
 * const heartbeat = Effect.gen(function*() {
 *   yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)
 * }).pipe(
 *   Effect.repeat(everyTwoSeconds)
 * )
 *
 * // Limited repeat - run only 5 times with 1-second spacing
 * const limitedTask = Effect.gen(function*() {
 *   yield* Console.log("Executing scheduled task...")
 *   yield* Effect.sleep("500 millis") // simulate work
 *   return "Task completed"
 * }).pipe(
 *   Effect.repeat(
 *     Schedule.spaced("1 second").pipe(Schedule.take(5))
 *   )
 * )
 *
 * // Simple spaced schedule with limited repetitions
 * const limitedSpaced = Schedule.spaced("100 millis").pipe(
 *   Schedule.compose(Schedule.recurs(5)) // at most 5 times
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("Starting spaced execution...")
 *
 *   yield* Effect.repeat(
 *     Effect.succeed("work item"),
 *     limitedSpaced
 *   )
 *
 *   yield* Console.log("Completed executions")
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "spaced";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a schedule that recurs continuously, each repetition spaced the specified duration from the last run.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Basic spaced schedule - runs every 2 seconds\nconst everyTwoSeconds = Schedule.spaced("2 seconds")\n\n// Heartbeat that runs indefinitely with fixed spacing\nconst heartbeat = Effect.gen(function*() {\n  yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)\n}).pipe(\n  Effect.repeat(everyTwoSeconds)\n)\n\n// Limited repeat - run only 5 times with 1-second spacing\nconst limitedTask = Effect.gen(function*() {\n  yield* Console.log("Executing scheduled task...")\n  yield* Effect.sleep("500 millis") // simulate work\n  return "Task completed"\n}).pipe(\n  Effect.repeat(\n    Schedule.spaced("1 second").pipe(Schedule.take(5))\n  )\n)\n\n// Simple spaced schedule with limited repetitions\nconst limitedSpaced = Schedule.spaced("100 millis").pipe(\n  Schedule.compose(Schedule.recurs(5)) // at most 5 times\n)\n\nconst program = Effect.gen(function*() {\n  yield* Console.log("Starting spaced execution...")\n\n  yield* Effect.repeat(\n    Effect.succeed("work item"),\n    limitedSpaced\n  )\n\n  yield* Console.log("Completed executions")\n})';
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
