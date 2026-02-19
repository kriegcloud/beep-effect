/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Takes a single element from the beginning of the MutableList. Returns the element if available, or the Empty symbol if the list is empty. The taken element is removed from the list.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<string>()
 * MutableList.appendAll(list, ["first", "second", "third"])
 *
 * // Take elements one by one
 * console.log(MutableList.take(list)) // "first"
 * console.log(list.length) // 2
 *
 * console.log(MutableList.take(list)) // "second"
 * console.log(MutableList.take(list)) // "third"
 * console.log(list.length) // 0
 *
 * // Take from empty list
 * console.log(MutableList.take(list)) // Empty symbol
 *
 * // Check for empty using the Empty symbol
 * const result = MutableList.take(list)
 * if (result === MutableList.Empty) {
 *   console.log("List is empty")
 * } else {
 *   console.log("Got element:", result)
 * }
 *
 * // Consumer pattern
 * function processNext<T>(
 *   queue: MutableList.MutableList<T>,
 *   processor: (item: T) => void
 * ): boolean {
 *   const item = MutableList.take(queue)
 *   if (item !== MutableList.Empty) {
 *     processor(item)
 *     return true
 *   }
 *   return false
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
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Takes a single element from the beginning of the MutableList. Returns the element if available, or the Empty symbol if the list is empty. The taken element is removed from the l...";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<string>()\nMutableList.appendAll(list, ["first", "second", "third"])\n\n// Take elements one by one\nconsole.log(MutableList.take(list)) // "first"\nconsole.log(list.length) // 2\n\nconsole.log(MutableList.take(list)) // "second"\nconsole.log(MutableList.take(list)) // "third"\nconsole.log(list.length) // 0\n\n// Take from empty list\nconsole.log(MutableList.take(list)) // Empty symbol\n\n// Check for empty using the Empty symbol\nconst result = MutableList.take(list)\nif (result === MutableList.Empty) {\n  console.log("List is empty")\n} else {\n  console.log("Got element:", result)\n}\n\n// Consumer pattern\nfunction processNext<T>(\n  queue: MutableList.MutableList<T>,\n  processor: (item: T) => void\n): boolean {\n  const item = MutableList.take(queue)\n  if (item !== MutableList.Empty) {\n    processor(item)\n    return true\n  }\n  return false\n}';
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
