/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:14:14.980Z
 *
 * Overview:
 * Updates the value of the specified key within the MutableHashMap if it exists. If the key doesn't exist, the map remains unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 * 
 * const map = MutableHashMap.make(["count", 5], ["total", 100])
 * 
 * // Increment existing value
 * MutableHashMap.modify(map, "count", (n) => n + 1)
 * console.log(MutableHashMap.get(map, "count")) // Some(6)
 * 
 * // Double existing value
 * MutableHashMap.modify(map, "total", (n) => n * 2)
 * console.log(MutableHashMap.get(map, "total")) // Some(200)
 * 
 * // Try to modify non-existent key (no effect)
 * MutableHashMap.modify(map, "missing", (n) => n + 1)
 * console.log(MutableHashMap.has(map, "missing")) // false
 * 
 * // Pipe-able version
 * const increment = MutableHashMap.modify("count", (n: number) => n + 1)
 * increment(map)
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
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "Updates the value of the specified key within the MutableHashMap if it exists. If the key doesn't exist, the map remains unchanged.";
const sourceExample = "import * as MutableHashMap from \"effect/MutableHashMap\"\n\nconst map = MutableHashMap.make([\"count\", 5], [\"total\", 100])\n\n// Increment existing value\nMutableHashMap.modify(map, \"count\", (n) => n + 1)\nconsole.log(MutableHashMap.get(map, \"count\")) // Some(6)\n\n// Double existing value\nMutableHashMap.modify(map, \"total\", (n) => n * 2)\nconsole.log(MutableHashMap.get(map, \"total\")) // Some(200)\n\n// Try to modify non-existent key (no effect)\nMutableHashMap.modify(map, \"missing\", (n) => n + 1)\nconsole.log(MutableHashMap.has(map, \"missing\")) // false\n\n// Pipe-able version\nconst increment = MutableHashMap.modify(\"count\", (n: number) => n + 1)\nincrement(map)";
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
