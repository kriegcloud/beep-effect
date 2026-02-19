/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: takeN
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Takes up to N elements from the beginning of the MutableList and returns them as an array. The taken elements are removed from the list. This operation is optimized for performance and includes zero-copy optimizations when possible.
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
 * // Take first 3 elements
 * const first3 = MutableList.takeN(list, 3)
 * console.log(first3) // [1, 2, 3]
 * console.log(list.length) // 7
 *
 * // Take more than available
 * const remaining = MutableList.takeN(list, 20)
 * console.log(remaining) // [4, 5, 6, 7, 8, 9, 10]
 * console.log(list.length) // 0
 *
 * // Take from empty list
 * const empty = MutableList.takeN(list, 5)
 * console.log(empty) // []
 *
 * // Batch processing pattern
 * const queue = MutableList.make<string>()
 * MutableList.appendAll(queue, ["task1", "task2", "task3", "task4", "task5"])
 *
 * while (queue.length > 0) {
 *   const batch = MutableList.takeN(queue, 2) // Process 2 at a time
 *   console.log("Processing batch:", batch)
 * }
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
const exportName = "takeN";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Takes up to N elements from the beginning of the MutableList and returns them as an array. The taken elements are removed from the list. This operation is optimized for performa...";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<number>()\nMutableList.appendAll(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\n\nconsole.log(list.length) // 10\n\n// Take first 3 elements\nconst first3 = MutableList.takeN(list, 3)\nconsole.log(first3) // [1, 2, 3]\nconsole.log(list.length) // 7\n\n// Take more than available\nconst remaining = MutableList.takeN(list, 20)\nconsole.log(remaining) // [4, 5, 6, 7, 8, 9, 10]\nconsole.log(list.length) // 0\n\n// Take from empty list\nconst empty = MutableList.takeN(list, 5)\nconsole.log(empty) // []\n\n// Batch processing pattern\nconst queue = MutableList.make<string>()\nMutableList.appendAll(queue, ["task1", "task2", "task3", "task4", "task5"])\n\nwhile (queue.length > 0) {\n  const batch = MutableList.takeN(queue, 2) // Process 2 at a time\n  console.log("Processing batch:", batch)\n}';
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
