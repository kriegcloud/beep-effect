/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: schedule
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Repeats an effect based on a specified schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * const task = Effect.gen(function*() {
 *   yield* Console.log("Task executing...")
 *   return Math.random()
 * })
 *
 * // Repeat 3 times with 1 second delay between executions
 * const program = Effect.schedule(
 *   task,
 *   Schedule.addDelay(Schedule.recurs(2), () => Effect.succeed("1 second"))
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Task executing... (immediate)
 * // Task executing... (after 1 second)
 * // Task executing... (after 1 second)
 * // Returns the count from Schedule.recurs
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "schedule";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Repeats an effect based on a specified schedule.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\nconst task = Effect.gen(function*() {\n  yield* Console.log("Task executing...")\n  return Math.random()\n})\n\n// Repeat 3 times with 1 second delay between executions\nconst program = Effect.schedule(\n  task,\n  Schedule.addDelay(Schedule.recurs(2), () => Effect.succeed("1 second"))\n)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Task executing... (immediate)\n// Task executing... (after 1 second)\n// Task executing... (after 1 second)\n// Returns the count from Schedule.recurs';
const moduleRecord = EffectModule as Record<string, unknown>;

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
