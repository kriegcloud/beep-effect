/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: fromStep
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Creates a Schedule from a step function that returns a Pull.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schedule } from "effect"
 *
 * // fromStep is an advanced function for creating custom schedules
 * // It requires a step function that returns a Pull value
 *
 * // Most users should use simpler schedule constructors like:
 * const simpleSchedule = Schedule.exponential("100 millis")
 * const spacedSchedule = Schedule.spaced("1 second")
 * const recurringSchedule = Schedule.recurs(5)
 *
 * // These can be combined and transformed as needed
 * const complexSchedule = simpleSchedule.pipe(
 *   Schedule.compose(Schedule.recurs(3))
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
const exportName = "fromStep";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Creates a Schedule from a step function that returns a Pull.";
const sourceExample =
  'import { Schedule } from "effect"\n\n// fromStep is an advanced function for creating custom schedules\n// It requires a step function that returns a Pull value\n\n// Most users should use simpler schedule constructors like:\nconst simpleSchedule = Schedule.exponential("100 millis")\nconst spacedSchedule = Schedule.spaced("1 second")\nconst recurringSchedule = Schedule.recurs(5)\n\n// These can be combined and transformed as needed\nconst complexSchedule = simpleSchedule.pipe(\n  Schedule.compose(Schedule.recurs(3))\n)';
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
