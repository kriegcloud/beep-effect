/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: satisfiesOutputType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Ensures that the provided schedule respects a specified output type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // satisfiesOutputType is a type-level function for compile-time constraints
 * // It ensures that a schedule's output type matches the specified type
 *
 * // Example with string output
 * const stringSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("hello")),
 *   Schedule.satisfiesOutputType<string>()
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
const exportName = "satisfiesOutputType";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Ensures that the provided schedule respects a specified output type.";
const sourceExample =
  'import { Effect, Schedule } from "effect"\n\n// satisfiesOutputType is a type-level function for compile-time constraints\n// It ensures that a schedule\'s output type matches the specified type\n\n// Example with string output\nconst stringSchedule = Schedule.exponential("100 millis").pipe(\n  Schedule.map(() => Effect.succeed("hello")),\n  Schedule.satisfiesOutputType<string>()\n)';
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
