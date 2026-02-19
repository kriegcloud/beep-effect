/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:50:37.846Z
 *
 * Overview:
 * Removes all elements from the MutableList, resetting it to an empty state. This operation is highly optimized and releases all internal memory.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<number>()
 * MutableList.appendAll(list, [1, 2, 3, 4, 5])
 *
 * console.log(list.length) // 5
 *
 * // Clear all elements
 * MutableList.clear(list)
 *
 * console.log(list.length) // 0
 * console.log(MutableList.take(list)) // Empty
 *
 * // Can still use the list after clearing
 * MutableList.append(list, 42)
 * console.log(list.length) // 1
 *
 * // Useful for resetting queues or buffers
 * function resetBuffer<T>(buffer: MutableList.MutableList<T>) {
 *   MutableList.clear(buffer)
 *   console.log("Buffer cleared and ready for reuse")
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MutableListModule from "effect/MutableList";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Removes all elements from the MutableList, resetting it to an empty state. This operation is highly optimized and releases all internal memory.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<number>()\nMutableList.appendAll(list, [1, 2, 3, 4, 5])\n\nconsole.log(list.length) // 5\n\n// Clear all elements\nMutableList.clear(list)\n\nconsole.log(list.length) // 0\nconsole.log(MutableList.take(list)) // Empty\n\n// Can still use the list after clearing\nMutableList.append(list, 42)\nconsole.log(list.length) // 1\n\n// Useful for resetting queues or buffers\nfunction resetBuffer<T>(buffer: MutableList.MutableList<T>) {\n  MutableList.clear(buffer)\n  console.log("Buffer cleared and ready for reuse")\n}';
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
