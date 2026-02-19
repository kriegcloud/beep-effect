/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: keys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:50:37.766Z
 *
 * Overview:
 * Extracts all keys from the MutableHashMap into an array.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(
 *   ["apple", 1],
 *   ["banana", 2],
 *   ["cherry", 3]
 * )
 *
 * const allKeys = Array.from(MutableHashMap.keys(map))
 * console.log(allKeys) // ["apple", "banana", "cherry"]
 *
 * // Useful for iteration or validation
 * const hasRequiredKeys = allKeys.includes("apple") && allKeys.includes("banana")
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
import * as MutableHashMapModule from "effect/MutableHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "keys";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "Extracts all keys from the MutableHashMap into an array.";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\n\nconst map = MutableHashMap.make(\n  ["apple", 1],\n  ["banana", 2],\n  ["cherry", 3]\n)\n\nconst allKeys = Array.from(MutableHashMap.keys(map))\nconsole.log(allKeys) // ["apple", "banana", "cherry"]\n\n// Useful for iteration or validation\nconst hasRequiredKeys = allKeys.includes("apple") && allKeys.includes("banana")';
const moduleRecord = MutableHashMapModule as Record<string, unknown>;

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
