/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:50:37.766Z
 *
 * Overview:
 * Retrieves the value associated with the specified key from the MutableHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(["key1", 42], ["key2", 100])
 *
 * console.log(MutableHashMap.get(map, "key1")) // Some(42)
 * console.log(MutableHashMap.get(map, "key3")) // None
 *
 * // Pipe-able version
 * const getValue = MutableHashMap.get("key1")
 * console.log(getValue(map)) // Some(42)
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
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "Retrieves the value associated with the specified key from the MutableHashMap.";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\n\nconst map = MutableHashMap.make(["key1", 42], ["key2", 100])\n\nconsole.log(MutableHashMap.get(map, "key1")) // Some(42)\nconsole.log(MutableHashMap.get(map, "key3")) // None\n\n// Pipe-able version\nconst getValue = MutableHashMap.get("key1")\nconsole.log(getValue(map)) // Some(42)';
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
