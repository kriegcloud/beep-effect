/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:14:14.980Z
 *
 * Overview:
 * Removes all key-value pairs from the MutableHashMap, mutating the map in place. The map becomes empty after this operation.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 * 
 * const map = MutableHashMap.make(
 *   ["key1", 42],
 *   ["key2", 100],
 *   ["key3", 200]
 * )
 * 
 * console.log(MutableHashMap.size(map)) // 3
 * 
 * // Clear all entries
 * MutableHashMap.clear(map)
 * 
 * console.log(MutableHashMap.size(map)) // 0
 * console.log(MutableHashMap.has(map, "key1")) // false
 * 
 * // Can still add new entries after clearing
 * MutableHashMap.set(map, "new", 999)
 * console.log(MutableHashMap.size(map)) // 1
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MutableHashMapModule from "effect/MutableHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "Removes all key-value pairs from the MutableHashMap, mutating the map in place. The map becomes empty after this operation.";
const sourceExample = "import * as MutableHashMap from \"effect/MutableHashMap\"\n\nconst map = MutableHashMap.make(\n  [\"key1\", 42],\n  [\"key2\", 100],\n  [\"key3\", 200]\n)\n\nconsole.log(MutableHashMap.size(map)) // 3\n\n// Clear all entries\nMutableHashMap.clear(map)\n\nconsole.log(MutableHashMap.size(map)) // 0\nconsole.log(MutableHashMap.has(map, \"key1\")) // false\n\n// Can still add new entries after clearing\nMutableHashMap.set(map, \"new\", 999)\nconsole.log(MutableHashMap.size(map)) // 1";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
