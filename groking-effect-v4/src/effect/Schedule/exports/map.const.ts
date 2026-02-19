/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Returns a new `Schedule` that maps the output of this schedule using the specified function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Transform schedule output from number to string
 * const countSchedule = Schedule.recurs(5).pipe(
 *   Schedule.map((count) => Effect.succeed(`Execution #${count + 1}`))
 * )
 * 
 * // Map schedule delays to human-readable format
 * const readableDelays = Schedule.exponential("100 millis").pipe(
 *   Schedule.map((duration) => Effect.succeed(`Next retry in ${duration}`))
 * )
 * 
 * // Transform numeric output to structured data
 * const structuredSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.map((recurrence) => Effect.succeed({
 *     iteration: recurrence + 1,
 *     timestamp: new Date().toISOString(),
 *     phase: recurrence < 5 ? "warmup" as const : "steady" as const
 *   }))
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.succeed("task completed"),
 *     structuredSchedule.pipe(
 *       Schedule.take(8),
 *       Schedule.tapOutput((info) =>
 *         Console.log(
 *           `${info.phase} phase - iteration ${info.iteration} at ${info.timestamp}`
 *         )
 *       )
 *     )
 *   )
 * 
 *   yield* Console.log(`Completed iterations`)
 * })
 * 
 * // Map with effectful transformation
 * const effectfulMap = Schedule.fixed("2 seconds").pipe(
 *   Schedule.map((count) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Processing count: ${count}`)
 *       return count * 10
 *     })
 *   )
 * )
 * 
 * // Combine mapping with other schedule operations
 * const complexSchedule = Schedule.fibonacci("100 millis").pipe(
 *   Schedule.map((delay) => Effect.succeed(`Delay: ${delay}`))
 * )
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that maps the output of this schedule using the specified function.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Transform schedule output from number to string\nconst countSchedule = Schedule.recurs(5).pipe(\n  Schedule.map((count) => Effect.succeed(`Execution #${count + 1}`))\n)\n\n// Map schedule delays to human-readable format\nconst readableDelays = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.map((duration) => Effect.succeed(`Next retry in ${duration}`))\n)\n\n// Transform numeric output to structured data\nconst structuredSchedule = Schedule.spaced(\"1 second\").pipe(\n  Schedule.map((recurrence) => Effect.succeed({\n    iteration: recurrence + 1,\n    timestamp: new Date().toISOString(),\n    phase: recurrence < 5 ? \"warmup\" as const : \"steady\" as const\n  }))\n)\n\nconst program = Effect.gen(function*() {\n  const results = yield* Effect.repeat(\n    Effect.succeed(\"task completed\"),\n    structuredSchedule.pipe(\n      Schedule.take(8),\n      Schedule.tapOutput((info) =>\n        Console.log(\n          `${info.phase} phase - iteration ${info.iteration} at ${info.timestamp}`\n        )\n      )\n    )\n  )\n\n  yield* Console.log(`Completed iterations`)\n})\n\n// Map with effectful transformation\nconst effectfulMap = Schedule.fixed(\"2 seconds\").pipe(\n  Schedule.map((count) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Processing count: ${count}`)\n      return count * 10\n    })\n  )\n)\n\n// Combine mapping with other schedule operations\nconst complexSchedule = Schedule.fibonacci(\"100 millis\").pipe(\n  Schedule.map((delay) => Effect.succeed(`Delay: ${delay}`))\n)";
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
