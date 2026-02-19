/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: fixed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * Returns a `Schedule` that recurs on the specified fixed `interval` and outputs the number of repetitions of the schedule so far.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Fixed interval schedule - runs exactly every 1 second
 * const everySecond = Schedule.fixed("1 second")
 * 
 * // Health check that runs at fixed intervals
 * const healthCheck = Effect.gen(function*() {
 *   yield* Console.log(`Health check at ${new Date().toISOString()}`)
 *   yield* Effect.sleep("200 millis") // simulate health check work
 *   return "healthy"
 * }).pipe(
 *   Effect.repeat(Schedule.fixed("2 seconds").pipe(Schedule.take(5)))
 * )
 * 
 * // Difference between fixed and spaced:
 * // - fixed: maintains constant rate regardless of action duration
 * // - spaced: waits for the duration AFTER each action completes
 * 
 * const longRunningTask = Effect.gen(function*() {
 *   yield* Console.log("Task started")
 *   yield* Effect.sleep("1.5 seconds") // Longer than interval
 *   yield* Console.log("Task completed")
 *   return "done"
 * })
 * 
 * // Fixed schedule: if task takes 1.5s but interval is 1s,
 * // next execution happens immediately (no pile-up)
 * const fixedSchedule = longRunningTask.pipe(
 *   Effect.repeat(Schedule.fixed("1 second").pipe(Schedule.take(3)))
 * )
 * 
 * // Comparing with spaced (waits 1s AFTER each task)
 * const spacedSchedule = longRunningTask.pipe(
 *   Effect.repeat(Schedule.spaced("1 second").pipe(Schedule.take(3)))
 * )
 * 
 * const program = Effect.gen(function*() {
 *   yield* Console.log("=== Fixed Schedule Demo ===")
 *   yield* fixedSchedule
 * 
 *   yield* Console.log("=== Spaced Schedule Demo ===")
 *   yield* spacedSchedule
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScheduleModule from "effect/Schedule";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fixed";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a `Schedule` that recurs on the specified fixed `interval` and outputs the number of repetitions of the schedule so far.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Fixed interval schedule - runs exactly every 1 second\nconst everySecond = Schedule.fixed(\"1 second\")\n\n// Health check that runs at fixed intervals\nconst healthCheck = Effect.gen(function*() {\n  yield* Console.log(`Health check at ${new Date().toISOString()}`)\n  yield* Effect.sleep(\"200 millis\") // simulate health check work\n  return \"healthy\"\n}).pipe(\n  Effect.repeat(Schedule.fixed(\"2 seconds\").pipe(Schedule.take(5)))\n)\n\n// Difference between fixed and spaced:\n// - fixed: maintains constant rate regardless of action duration\n// - spaced: waits for the duration AFTER each action completes\n\nconst longRunningTask = Effect.gen(function*() {\n  yield* Console.log(\"Task started\")\n  yield* Effect.sleep(\"1.5 seconds\") // Longer than interval\n  yield* Console.log(\"Task completed\")\n  return \"done\"\n})\n\n// Fixed schedule: if task takes 1.5s but interval is 1s,\n// next execution happens immediately (no pile-up)\nconst fixedSchedule = longRunningTask.pipe(\n  Effect.repeat(Schedule.fixed(\"1 second\").pipe(Schedule.take(3)))\n)\n\n// Comparing with spaced (waits 1s AFTER each task)\nconst spacedSchedule = longRunningTask.pipe(\n  Effect.repeat(Schedule.spaced(\"1 second\").pipe(Schedule.take(3)))\n)\n\nconst program = Effect.gen(function*() {\n  yield* Console.log(\"=== Fixed Schedule Demo ===\")\n  yield* fixedSchedule\n\n  yield* Console.log(\"=== Spaced Schedule Demo ===\")\n  yield* spacedSchedule\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
