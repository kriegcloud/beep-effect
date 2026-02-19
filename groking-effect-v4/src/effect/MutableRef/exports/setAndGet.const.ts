/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: setAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:50:37.857Z
 *
 * Overview:
 * Sets the MutableRef to a new value and returns the new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const ref = MutableRef.make("old")
 *
 * // Set and get the new value
 * const newValue = MutableRef.setAndGet(ref, "new")
 * console.log(newValue) // "new"
 * console.log(MutableRef.get(ref)) // "new"
 *
 * // Useful for assignments that need the value
 * const counter = MutableRef.make(0)
 * const currentValue = MutableRef.setAndGet(counter, 42)
 * console.log(`Counter set to: ${currentValue}`) // "Counter set to: 42"
 *
 * // Pipe-able version
 * const setValue = MutableRef.setAndGet("final")
 * const result = setValue(ref)
 * console.log(result) // "final"
 *
 * // Difference from set: returns value instead of reference
 * const ref1 = MutableRef.make(1)
 * const returnedRef = MutableRef.set(ref1, 2) // Returns MutableRef
 * const returnedValue = MutableRef.setAndGet(ref1, 3) // Returns value
 * console.log(returnedValue) // 3
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
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "setAndGet";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Sets the MutableRef to a new value and returns the new value.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst ref = MutableRef.make("old")\n\n// Set and get the new value\nconst newValue = MutableRef.setAndGet(ref, "new")\nconsole.log(newValue) // "new"\nconsole.log(MutableRef.get(ref)) // "new"\n\n// Useful for assignments that need the value\nconst counter = MutableRef.make(0)\nconst currentValue = MutableRef.setAndGet(counter, 42)\nconsole.log(`Counter set to: ${currentValue}`) // "Counter set to: 42"\n\n// Pipe-able version\nconst setValue = MutableRef.setAndGet("final")\nconst result = setValue(ref)\nconsole.log(result) // "final"\n\n// Difference from set: returns value instead of reference\nconst ref1 = MutableRef.make(1)\nconst returnedRef = MutableRef.set(ref1, 2) // Returns MutableRef\nconst returnedValue = MutableRef.setAndGet(ref1, 3) // Returns value\nconsole.log(returnedValue) // 3';
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
