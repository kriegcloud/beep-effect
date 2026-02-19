/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: whileLoop
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.917Z
 *
 * Overview:
 * Executes a body effect repeatedly while a condition holds true.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * let counter = 0
 *
 * const program = Effect.whileLoop({
 *   while: () => counter < 5,
 *   body: () => Effect.sync(() => ++counter),
 *   step: (n) => console.log(`Current count: ${n}`)
 * })
 *
 * Effect.runPromise(program)
 * // Output:
 * // Current count: 1
 * // Current count: 2
 * // Current count: 3
 * // Current count: 4
 * // Current count: 5
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
const exportName = "whileLoop";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Executes a body effect repeatedly while a condition holds true.";
const sourceExample =
  'import { Effect } from "effect"\n\nlet counter = 0\n\nconst program = Effect.whileLoop({\n  while: () => counter < 5,\n  body: () => Effect.sync(() => ++counter),\n  step: (n) => console.log(`Current count: ${n}`)\n})\n\nEffect.runPromise(program)\n// Output:\n// Current count: 1\n// Current count: 2\n// Current count: 3\n// Current count: 4\n// Current count: 5';
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
