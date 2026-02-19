/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: satisfiesInputType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Ensures that the provided schedule respects a specified input type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schedule } from "effect"
 *
 * // Ensure schedule accepts string inputs
 * const stringSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.satisfiesInputType<string>()
 * )
 *
 * // Ensure schedule accepts number inputs
 * const numberSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.satisfiesInputType<number>()
 * )
 *
 * // Type-level constraint - this would be a compile error:
 * // Schedule.recurs(3).pipe(Schedule.satisfiesInputType<CustomType>())
 * // where CustomType doesn't match the schedule's input type
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
const exportName = "satisfiesInputType";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Ensures that the provided schedule respects a specified input type.";
const sourceExample =
  'import { Schedule } from "effect"\n\n// Ensure schedule accepts string inputs\nconst stringSchedule = Schedule.exponential("100 millis").pipe(\n  Schedule.satisfiesInputType<string>()\n)\n\n// Ensure schedule accepts number inputs\nconst numberSchedule = Schedule.spaced("1 second").pipe(\n  Schedule.satisfiesInputType<number>()\n)\n\n// Type-level constraint - this would be a compile error:\n// Schedule.recurs(3).pipe(Schedule.satisfiesInputType<CustomType>())\n// where CustomType doesn\'t match the schedule\'s input type';
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
