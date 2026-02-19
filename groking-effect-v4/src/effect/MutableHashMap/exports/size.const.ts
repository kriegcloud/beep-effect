/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:14:14.981Z
 *
 * Overview:
 * Returns the number of key-value pairs in the MutableHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.empty<string, number>()
 * console.log(MutableHashMap.size(map)) // 0
 *
 * MutableHashMap.set(map, "key1", 42)
 * MutableHashMap.set(map, "key2", 100)
 * console.log(MutableHashMap.size(map)) // 2
 *
 * MutableHashMap.remove(map, "key1")
 * console.log(MutableHashMap.size(map)) // 1
 *
 * MutableHashMap.clear(map)
 * console.log(MutableHashMap.size(map)) // 0
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
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "Returns the number of key-value pairs in the MutableHashMap.";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\n\nconst map = MutableHashMap.empty<string, number>()\nconsole.log(MutableHashMap.size(map)) // 0\n\nMutableHashMap.set(map, "key1", 42)\nMutableHashMap.set(map, "key2", 100)\nconsole.log(MutableHashMap.size(map)) // 2\n\nMutableHashMap.remove(map, "key1")\nconsole.log(MutableHashMap.size(map)) // 1\n\nMutableHashMap.clear(map)\nconsole.log(MutableHashMap.size(map)) // 0';
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
