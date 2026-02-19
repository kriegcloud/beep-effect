/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: forever
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.909Z
 *
 * Overview:
 * Repeats this effect forever (until the first error).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 *
 * const task = Effect.gen(function*() {
 *   yield* Console.log("Task running...")
 *   yield* Effect.sleep("1 second")
 * })
 *
 * // This will run forever, printing every second
 * const program = task.pipe(Effect.forever)
 *
 * // This will run forever, without yielding every iteration
 * const programNoYield = task.pipe(Effect.forever({ disableYield: true }))
 *
 * // Run for 5 seconds then interrupt
 * const timedProgram = Effect.gen(function*() {
 *   const fiber = yield* Effect.forkChild(program)
 *   yield* Effect.sleep("5 seconds")
 *   yield* Fiber.interrupt(fiber)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "forever";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Repeats this effect forever (until the first error).";
const sourceExample =
  'import { Console, Effect, Fiber } from "effect"\n\nconst task = Effect.gen(function*() {\n  yield* Console.log("Task running...")\n  yield* Effect.sleep("1 second")\n})\n\n// This will run forever, printing every second\nconst program = task.pipe(Effect.forever)\n\n// This will run forever, without yielding every iteration\nconst programNoYield = task.pipe(Effect.forever({ disableYield: true }))\n\n// Run for 5 seconds then interrupt\nconst timedProgram = Effect.gen(function*() {\n  const fiber = yield* Effect.forkChild(program)\n  yield* Effect.sleep("5 seconds")\n  yield* Fiber.interrupt(fiber)\n})';
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
