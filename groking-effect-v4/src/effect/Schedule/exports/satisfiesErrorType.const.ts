/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: satisfiesErrorType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Ensures that the provided schedule respects a specified error type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Schedule } from "effect"
 *
 * // Create a custom error using Data.TaggedError
 * class CustomError extends Data.TaggedError("CustomError")<{
 *   message: string
 * }> {}
 *
 * // Ensure schedule handles CustomError types
 * const errorSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.satisfiesErrorType<CustomError>()
 * )
 *
 * // Ensure schedule handles never errors (no errors)
 * const safeSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.satisfiesErrorType<never>()
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
const exportName = "satisfiesErrorType";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Ensures that the provided schedule respects a specified error type.";
const sourceExample =
  'import { Data, Schedule } from "effect"\n\n// Create a custom error using Data.TaggedError\nclass CustomError extends Data.TaggedError("CustomError")<{\n  message: string\n}> {}\n\n// Ensure schedule handles CustomError types\nconst errorSchedule = Schedule.exponential("100 millis").pipe(\n  Schedule.satisfiesErrorType<CustomError>()\n)\n\n// Ensure schedule handles never errors (no errors)\nconst safeSchedule = Schedule.spaced("1 second").pipe(\n  Schedule.satisfiesErrorType<never>()\n)';
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
