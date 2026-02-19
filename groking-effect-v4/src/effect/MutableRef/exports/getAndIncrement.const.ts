/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: getAndIncrement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Increments a numeric MutableRef by 1 and returns the previous value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const counter = MutableRef.make(5)
 *
 * // Get current value and then increment
 * const previousValue = MutableRef.getAndIncrement(counter)
 * console.log(previousValue) // 5
 * console.log(MutableRef.get(counter)) // 6
 *
 * // Useful for ID generation
 * const idGenerator = MutableRef.make(0)
 * const getId = () => MutableRef.getAndIncrement(idGenerator)
 *
 * console.log(getId()) // 0
 * console.log(getId()) // 1
 * console.log(getId()) // 2
 *
 * // Post-increment semantics (like i++ in other languages)
 * const position = MutableRef.make(0)
 * const currentPos = MutableRef.getAndIncrement(position)
 * console.log(`Was at: ${currentPos}, Now at: ${MutableRef.get(position)}`) // "Was at: 0, Now at: 1"
 *
 * // Useful for iteration counters
 * const iterations = MutableRef.make(0)
 * while (MutableRef.get(iterations) < 5) {
 *   const iteration = MutableRef.getAndIncrement(iterations)
 *   console.log(`Iteration ${iteration}`)
 * }
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
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getAndIncrement";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Increments a numeric MutableRef by 1 and returns the previous value.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst counter = MutableRef.make(5)\n\n// Get current value and then increment\nconst previousValue = MutableRef.getAndIncrement(counter)\nconsole.log(previousValue) // 5\nconsole.log(MutableRef.get(counter)) // 6\n\n// Useful for ID generation\nconst idGenerator = MutableRef.make(0)\nconst getId = () => MutableRef.getAndIncrement(idGenerator)\n\nconsole.log(getId()) // 0\nconsole.log(getId()) // 1\nconsole.log(getId()) // 2\n\n// Post-increment semantics (like i++ in other languages)\nconst position = MutableRef.make(0)\nconst currentPos = MutableRef.getAndIncrement(position)\nconsole.log(`Was at: ${currentPos}, Now at: ${MutableRef.get(position)}`) // "Was at: 0, Now at: 1"\n\n// Useful for iteration counters\nconst iterations = MutableRef.make(0)\nwhile (MutableRef.get(iterations) < 5) {\n  const iteration = MutableRef.getAndIncrement(iterations)\n  console.log(`Iteration ${iteration}`)\n}';
const moduleRecord = MutableRefModule as Record<string, unknown>;

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
