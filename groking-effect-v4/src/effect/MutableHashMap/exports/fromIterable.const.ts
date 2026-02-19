/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashMap
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashMap.ts
 * Generated: 2026-02-19T04:50:37.766Z
 *
 * Overview:
 * Creates a MutableHashMap from an iterable collection of key-value pairs.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const entries = [
 *   ["apple", 1],
 *   ["banana", 2],
 *   ["cherry", 3]
 * ] as const
 *
 * const map = MutableHashMap.fromIterable(entries)
 *
 * console.log(MutableHashMap.get(map, "banana")) // Some(2)
 * console.log(MutableHashMap.size(map)) // 3
 *
 * // Works with any iterable
 * const fromMap = MutableHashMap.fromIterable(new Map([["x", 10], ["y", 20]]))
 * console.log(MutableHashMap.get(fromMap, "x")) // Some(10)
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashMap";
const sourceSummary = "Creates a MutableHashMap from an iterable collection of key-value pairs.";
const sourceExample =
  'import * as MutableHashMap from "effect/MutableHashMap"\n\nconst entries = [\n  ["apple", 1],\n  ["banana", 2],\n  ["cherry", 3]\n] as const\n\nconst map = MutableHashMap.fromIterable(entries)\n\nconsole.log(MutableHashMap.get(map, "banana")) // Some(2)\nconsole.log(MutableHashMap.size(map)) // 3\n\n// Works with any iterable\nconst fromMap = MutableHashMap.fromIterable(new Map([["x", 10], ["y", 20]]))\nconsole.log(MutableHashMap.get(fromMap, "x")) // Some(10)';
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
