/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: bothRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting the result of the right schedule (i.e. `other`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Combine two schedules, keeping right output
 * const leftSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("left-result"))
 * )
 * const rightSchedule = Schedule.spaced("50 millis").pipe(
 *   Schedule.map(() => Effect.succeed("right-result"))
 * )
 * 
 * const combined = Schedule.bothRight(leftSchedule, rightSchedule)
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-done"
 *     }),
 *     combined.pipe(Schedule.take(3))
 *   )
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
const exportName = "bothRight";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting the result of the rig...";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Combine two schedules, keeping right output\nconst leftSchedule = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.map(() => Effect.succeed(\"left-result\"))\n)\nconst rightSchedule = Schedule.spaced(\"50 millis\").pipe(\n  Schedule.map(() => Effect.succeed(\"right-result\"))\n)\n\nconst combined = Schedule.bothRight(leftSchedule, rightSchedule)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Task executed\")\n      return \"task-done\"\n    }),\n    combined.pipe(Schedule.take(3))\n  )\n})";
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
