/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:50:37.846Z
 *
 * Overview:
 * Removes all occurrences of a specific value from the MutableList. This operation modifies the list in place.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<string>()
 * MutableList.appendAll(list, ["apple", "banana", "apple", "cherry", "apple"])
 *
 * console.log(list.length) // 5
 *
 * // Remove all occurrences of "apple"
 * MutableList.remove(list, "apple")
 *
 * console.log(list.length) // 2
 * console.log(MutableList.takeAll(list)) // ["banana", "cherry"]
 *
 * // Remove non-existent value (no effect)
 * MutableList.remove(list, "grape")
 * console.log(list.length) // 2
 *
 * // Real-world example: removing completed tasks
 * const tasks = MutableList.make<{ id: number; status: string }>()
 * MutableList.appendAll(tasks, [
 *   { id: 1, status: "pending" },
 *   { id: 2, status: "completed" },
 *   { id: 3, status: "pending" },
 *   { id: 4, status: "completed" }
 * ])
 *
 * // Remove completed tasks by filtering status
 * MutableList.filter(tasks, (task) => task.status !== "completed")
 * console.log(MutableList.takeAll(tasks)) // Only pending tasks
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
import * as MutableListModule from "effect/MutableList";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Removes all occurrences of a specific value from the MutableList. This operation modifies the list in place.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<string>()\nMutableList.appendAll(list, ["apple", "banana", "apple", "cherry", "apple"])\n\nconsole.log(list.length) // 5\n\n// Remove all occurrences of "apple"\nMutableList.remove(list, "apple")\n\nconsole.log(list.length) // 2\nconsole.log(MutableList.takeAll(list)) // ["banana", "cherry"]\n\n// Remove non-existent value (no effect)\nMutableList.remove(list, "grape")\nconsole.log(list.length) // 2\n\n// Real-world example: removing completed tasks\nconst tasks = MutableList.make<{ id: number; status: string }>()\nMutableList.appendAll(tasks, [\n  { id: 1, status: "pending" },\n  { id: 2, status: "completed" },\n  { id: 3, status: "pending" },\n  { id: 4, status: "completed" }\n])\n\n// Remove completed tasks by filtering status\nMutableList.filter(tasks, (task) => task.status !== "completed")\nconsole.log(MutableList.takeAll(tasks)) // Only pending tasks';
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
