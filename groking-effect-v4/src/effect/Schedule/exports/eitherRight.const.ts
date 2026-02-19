/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: eitherRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the right schedule (i.e. `other`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Combine two schedules with either semantics, keeping right output
 * const primarySchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("primary-result")),
 *   Schedule.take(2)
 * )
 * const backupSchedule = Schedule.spaced("500 millis").pipe(
 *   Schedule.map(() => Effect.succeed("backup-result"))
 * )
 * 
 * const combined = Schedule.eitherRight(primarySchedule, backupSchedule)
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-done"
 *     }),
 *     combined.pipe(Schedule.take(5))
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
const exportName = "eitherRight";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the ...";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Combine two schedules with either semantics, keeping right output\nconst primarySchedule = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.map(() => Effect.succeed(\"primary-result\")),\n  Schedule.take(2)\n)\nconst backupSchedule = Schedule.spaced(\"500 millis\").pipe(\n  Schedule.map(() => Effect.succeed(\"backup-result\"))\n)\n\nconst combined = Schedule.eitherRight(primarySchedule, backupSchedule)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Task executed\")\n      return \"task-done\"\n    }),\n    combined.pipe(Schedule.take(5))\n  )\n})";
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
