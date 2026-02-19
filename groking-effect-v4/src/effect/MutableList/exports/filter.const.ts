/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Filters the MutableList in place, keeping only elements that satisfy the predicate. This operation modifies the list and rebuilds its internal structure for efficiency.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<number>()
 * MutableList.appendAll(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
 *
 * console.log(list.length) // 10
 *
 * // Keep only even numbers
 * MutableList.filter(list, (n) => n % 2 === 0)
 *
 * console.log(list.length) // 5
 * console.log(MutableList.takeAll(list)) // [2, 4, 6, 8, 10]
 *
 * // Filter with index
 * const indexed = MutableList.make<string>()
 * MutableList.appendAll(indexed, ["a", "b", "c", "d", "e"])
 *
 * // Keep elements at even indices
 * MutableList.filter(indexed, (value, index) => index % 2 === 0)
 * console.log(MutableList.takeAll(indexed)) // ["a", "c", "e"]
 *
 * // Real-world example: filtering a log queue
 * const logs = MutableList.make<{ level: string; message: string }>()
 * MutableList.appendAll(logs, [
 *   { level: "INFO", message: "App started" },
 *   { level: "ERROR", message: "Connection failed" },
 *   { level: "DEBUG", message: "Cache hit" },
 *   { level: "ERROR", message: "Timeout" }
 * ])
 *
 * // Keep only errors
 * MutableList.filter(logs, (log) => log.level === "ERROR")
 * console.log(MutableList.takeAll(logs)) // Only error logs
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
import * as MutableListModule from "effect/MutableList";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Filters the MutableList in place, keeping only elements that satisfy the predicate. This operation modifies the list and rebuilds its internal structure for efficiency.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<number>()\nMutableList.appendAll(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\n\nconsole.log(list.length) // 10\n\n// Keep only even numbers\nMutableList.filter(list, (n) => n % 2 === 0)\n\nconsole.log(list.length) // 5\nconsole.log(MutableList.takeAll(list)) // [2, 4, 6, 8, 10]\n\n// Filter with index\nconst indexed = MutableList.make<string>()\nMutableList.appendAll(indexed, ["a", "b", "c", "d", "e"])\n\n// Keep elements at even indices\nMutableList.filter(indexed, (value, index) => index % 2 === 0)\nconsole.log(MutableList.takeAll(indexed)) // ["a", "c", "e"]\n\n// Real-world example: filtering a log queue\nconst logs = MutableList.make<{ level: string; message: string }>()\nMutableList.appendAll(logs, [\n  { level: "INFO", message: "App started" },\n  { level: "ERROR", message: "Connection failed" },\n  { level: "DEBUG", message: "Cache hit" },\n  { level: "ERROR", message: "Timeout" }\n])\n\n// Keep only errors\nMutableList.filter(logs, (log) => log.level === "ERROR")\nconsole.log(MutableList.takeAll(logs)) // Only error logs';
const moduleRecord = MutableListModule as Record<string, unknown>;

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
