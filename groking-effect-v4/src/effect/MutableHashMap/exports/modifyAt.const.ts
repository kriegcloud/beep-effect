/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: modifyAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:50:37.766Z
 *
 * Overview:
 * Sets or removes the specified key in the MutableHashMap using an update function. The function receives the current value as an Option and returns an Option. If the function returns Some, the key is set to that value. If the function returns None, the key is removed.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 * import * as Option from "effect/Option"
 *
 * const map = MutableHashMap.make(["count", 5])
 *
 * // Update existing key
 * MutableHashMap.modifyAt(
 *   map,
 *   "count",
 *   (option) => Option.map(option, (n) => n * 2)
 * )
 * console.log(MutableHashMap.get(map, "count")) // Some(10)
 *
 * // Add new key
 * MutableHashMap.modifyAt(
 *   map,
 *   "new",
 *   (option) => Option.isNone(option) ? Option.some(42) : option
 * )
 * console.log(MutableHashMap.get(map, "new")) // Some(42)
 *
 * // Remove key by returning None
 * MutableHashMap.modifyAt(map, "count", () => Option.none())
 * console.log(MutableHashMap.has(map, "count")) // false
 *
 * // Conditional update
 * MutableHashMap.modifyAt(
 *   map,
 *   "new",
 *   (option) => Option.filter(option, (n) => n > 50) // Remove if <= 50
 * )
 * console.log(MutableHashMap.has(map, "new")) // false (42 <= 50)
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
const exportName = "modifyAt";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary =
  "Sets or removes the specified key in the MutableHashMap using an update function. The function receives the current value as an Option and returns an Option. If the function ret...";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\nimport * as Option from "effect/Option"\n\nconst map = MutableHashMap.make(["count", 5])\n\n// Update existing key\nMutableHashMap.modifyAt(\n  map,\n  "count",\n  (option) => Option.map(option, (n) => n * 2)\n)\nconsole.log(MutableHashMap.get(map, "count")) // Some(10)\n\n// Add new key\nMutableHashMap.modifyAt(\n  map,\n  "new",\n  (option) => Option.isNone(option) ? Option.some(42) : option\n)\nconsole.log(MutableHashMap.get(map, "new")) // Some(42)\n\n// Remove key by returning None\nMutableHashMap.modifyAt(map, "count", () => Option.none())\nconsole.log(MutableHashMap.has(map, "count")) // false\n\n// Conditional update\nMutableHashMap.modifyAt(\n  map,\n  "new",\n  (option) => Option.filter(option, (n) => n > 50) // Remove if <= 50\n)\nconsole.log(MutableHashMap.has(map, "new")) // false (42 <= 50)';
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
