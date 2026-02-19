/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: eitherWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the combination of both schedule outputs using the specified `combine` function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine schedules with either semantics and custom combination
 * const primarySchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("primary")),
 *   Schedule.take(2)
 * )
 * const fallbackSchedule = Schedule.spaced("500 millis").pipe(
 *   Schedule.map(() => Effect.succeed("fallback"))
 * )
 *
 * const combined = Schedule.eitherWith(
 *   primarySchedule,
 *   fallbackSchedule,
 *   (primary, fallback) => `${primary}+${fallback}`
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-result"
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
const exportName = "eitherWith";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the ...";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Combine schedules with either semantics and custom combination\nconst primarySchedule = Schedule.exponential("100 millis").pipe(\n  Schedule.map(() => Effect.succeed("primary")),\n  Schedule.take(2)\n)\nconst fallbackSchedule = Schedule.spaced("500 millis").pipe(\n  Schedule.map(() => Effect.succeed("fallback"))\n)\n\nconst combined = Schedule.eitherWith(\n  primarySchedule,\n  fallbackSchedule,\n  (primary, fallback) => `${primary}+${fallback}`\n)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Task executed")\n      return "task-result"\n    }),\n    combined.pipe(Schedule.take(5))\n  )\n})';
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
