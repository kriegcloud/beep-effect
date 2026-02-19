/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: toStepWithSleep
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.053Z
 *
 * Overview:
 * Extracts a step function from a Schedule that automatically handles sleep delays.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // Convert schedule to step function with automatic sleeping
 * const schedule = Schedule.spaced("1 second").pipe(Schedule.take(3))
 *
 * const program = Effect.gen(function*() {
 *   const stepWithSleep = yield* Schedule.toStepWithSleep(schedule)
 *
 *   // Each call will automatically sleep for the scheduled delay
 *   console.log("Starting...")
 *   const result1 = yield* stepWithSleep("first")
 *   console.log(`First result: ${result1}`)
 *
 *   const result2 = yield* stepWithSleep("second")
 *   console.log(`Second result: ${result2}`)
 *
 *   const result3 = yield* stepWithSleep("third")
 *   console.log(`Third result: ${result3}`)
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
const exportName = "toStepWithSleep";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Extracts a step function from a Schedule that automatically handles sleep delays.";
const sourceExample =
  'import { Effect, Schedule } from "effect"\n\n// Convert schedule to step function with automatic sleeping\nconst schedule = Schedule.spaced("1 second").pipe(Schedule.take(3))\n\nconst program = Effect.gen(function*() {\n  const stepWithSleep = yield* Schedule.toStepWithSleep(schedule)\n\n  // Each call will automatically sleep for the scheduled delay\n  console.log("Starting...")\n  const result1 = yield* stepWithSleep("first")\n  console.log(`First result: ${result1}`)\n\n  const result2 = yield* stepWithSleep("second")\n  console.log(`Second result: ${result2}`)\n\n  const result3 = yield* stepWithSleep("third")\n  console.log(`Third result: ${result3}`)\n})';
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
