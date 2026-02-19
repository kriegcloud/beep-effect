/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:14:14.981Z
 *
 * Overview:
 * Removes the specified key from the MutableHashMap, mutating the map in place. If the key doesn't exist, the map remains unchanged.
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
 * // Remove existing key
 * MutableHashMap.remove(map, "key2")
 * console.log(MutableHashMap.size(map)) // 2
 * console.log(MutableHashMap.has(map, "key2")) // false
 *
 * // Remove non-existent key (no effect)
 * MutableHashMap.remove(map, "nonexistent")
 * console.log(MutableHashMap.size(map)) // 2
 *
 * // Pipe-able version
 * const removeKey = MutableHashMap.remove("key1")
 * removeKey(map)
 * console.log(MutableHashMap.size(map)) // 1
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
import * as MutableHashMapModule from "effect/MutableHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary =
  "Removes the specified key from the MutableHashMap, mutating the map in place. If the key doesn't exist, the map remains unchanged.";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\n\nconst map = MutableHashMap.make(\n  ["key1", 42],\n  ["key2", 100],\n  ["key3", 200]\n)\n\nconsole.log(MutableHashMap.size(map)) // 3\n\n// Remove existing key\nMutableHashMap.remove(map, "key2")\nconsole.log(MutableHashMap.size(map)) // 2\nconsole.log(MutableHashMap.has(map, "key2")) // false\n\n// Remove non-existent key (no effect)\nMutableHashMap.remove(map, "nonexistent")\nconsole.log(MutableHashMap.size(map)) // 2\n\n// Pipe-able version\nconst removeKey = MutableHashMap.remove("key1")\nremoveKey(map)\nconsole.log(MutableHashMap.size(map)) // 1';
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
