/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: MutableHashMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:50:37.766Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * // Create a mutable hash map with string keys and number values
 * const map: MutableHashMap.MutableHashMap<string, number> = MutableHashMap
 *   .empty()
 *
 * // Add some data
 * MutableHashMap.set(map, "count", 42)
 * MutableHashMap.set(map, "total", 100)
 *
 * // Use as iterable
 * for (const [key, value] of map) {
 *   console.log(`${key}: ${value}`)
 * }
 * // Output:
 * // count: 42
 * // total: 100
 *
 * // Convert to array
 * const entries = Array.from(map)
 * console.log(entries) // [["count", 42], ["total", 100]]
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MutableHashMapModule from "effect/MutableHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MutableHashMap";
const exportKind = "interface";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\n\n// Create a mutable hash map with string keys and number values\nconst map: MutableHashMap.MutableHashMap<string, number> = MutableHashMap\n  .empty()\n\n// Add some data\nMutableHashMap.set(map, "count", 42)\nMutableHashMap.set(map, "total", 100)\n\n// Use as iterable\nfor (const [key, value] of map) {\n  console.log(`${key}: ${value}`)\n}\n// Output:\n// count: 42\n// total: 100\n\n// Convert to array\nconst entries = Array.from(map)\nconsole.log(entries) // [["count", 42], ["total", 100]]';
const moduleRecord = MutableHashMapModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
