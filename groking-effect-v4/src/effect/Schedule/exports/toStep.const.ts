/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: toStep
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:50:39.069Z
 *
 * Overview:
 * Extracts the step function from a Schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // Extract step function from an existing schedule
 * const schedule = Schedule.exponential("100 millis").pipe(Schedule.take(3))
 *
 * const program = Effect.gen(function*() {
 *   const stepFn = yield* Schedule.toStep(schedule)
 *
 *   // Use the step function directly for custom logic
 *   const now = Date.now()
 *   const result = yield* stepFn(now, "input")
 *
 *   console.log(`Step result: ${result}`)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toStep";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Extracts the step function from a Schedule.";
const sourceExample =
  'import { Effect, Schedule } from "effect"\n\n// Extract step function from an existing schedule\nconst schedule = Schedule.exponential("100 millis").pipe(Schedule.take(3))\n\nconst program = Effect.gen(function*() {\n  const stepFn = yield* Schedule.toStep(schedule)\n\n  // Use the step function directly for custom logic\n  const now = Date.now()\n  const result = yield* stepFn(now, "input")\n\n  console.log(`Step result: ${result}`)\n})';
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
