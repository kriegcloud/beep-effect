/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: takeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Takes all elements from the MutableList and returns them as an array. The list becomes empty after this operation. This is equivalent to takeN(list, list.length).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 * 
 * const list = MutableList.make<string>()
 * MutableList.appendAll(list, ["apple", "banana", "cherry"])
 * 
 * console.log(list.length) // 3
 * 
 * // Take all elements
 * const allItems = MutableList.takeAll(list)
 * console.log(allItems) // ["apple", "banana", "cherry"]
 * console.log(list.length) // 0
 * 
 * // Useful for converting to array and clearing
 * const queue = MutableList.make<number>()
 * MutableList.appendAll(queue, [1, 2, 3, 4, 5])
 * 
 * const snapshot = MutableList.takeAll(queue)
 * console.log("Queue contents:", snapshot)
 * console.log("Queue is now empty:", queue.length === 0)
 * 
 * // Drain pattern for processing
 * function drainAndProcess<T>(
 *   list: MutableList.MutableList<T>,
 *   processor: (items: Array<T>) => void
 * ) {
 *   if (list.length > 0) {
 *     const items = MutableList.takeAll(list)
 *     processor(items)
 *   }
 * }
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
import * as MutableListModule from "effect/MutableList";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "takeAll";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary = "Takes all elements from the MutableList and returns them as an array. The list becomes empty after this operation. This is equivalent to takeN(list, list.length).";
const sourceExample = "import * as MutableList from \"effect/MutableList\"\n\nconst list = MutableList.make<string>()\nMutableList.appendAll(list, [\"apple\", \"banana\", \"cherry\"])\n\nconsole.log(list.length) // 3\n\n// Take all elements\nconst allItems = MutableList.takeAll(list)\nconsole.log(allItems) // [\"apple\", \"banana\", \"cherry\"]\nconsole.log(list.length) // 0\n\n// Useful for converting to array and clearing\nconst queue = MutableList.make<number>()\nMutableList.appendAll(queue, [1, 2, 3, 4, 5])\n\nconst snapshot = MutableList.takeAll(queue)\nconsole.log(\"Queue contents:\", snapshot)\nconsole.log(\"Queue is now empty:\", queue.length === 0)\n\n// Drain pattern for processing\nfunction drainAndProcess<T>(\n  list: MutableList.MutableList<T>,\n  processor: (items: Array<T>) => void\n) {\n  if (list.length > 0) {\n    const items = MutableList.takeAll(list)\n    processor(items)\n  }\n}";
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
