/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: prependAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Prepends all elements from an iterable to the beginning of the MutableList. The elements are added in order, so the first element in the iterable becomes the new head of the list.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<number>()
 * MutableList.append(list, 4)
 * MutableList.append(list, 5)
 *
 * // Prepend multiple elements
 * MutableList.prependAll(list, [1, 2, 3])
 *
 * console.log(list.length) // 5
 *
 * // Elements are taken in order: [1, 2, 3, 4, 5]
 * console.log(MutableList.takeAll(list)) // [1, 2, 3, 4, 5]
 *
 * // Works with any iterable
 * const newList = MutableList.make<string>()
 * MutableList.prependAll(newList, "hello") // Prepends each character
 * console.log(MutableList.takeAll(newList)) // ["h", "e", "l", "l", "o"]
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
const exportName = "prependAll";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Prepends all elements from an iterable to the beginning of the MutableList. The elements are added in order, so the first element in the iterable becomes the new head of the list.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<number>()\nMutableList.append(list, 4)\nMutableList.append(list, 5)\n\n// Prepend multiple elements\nMutableList.prependAll(list, [1, 2, 3])\n\nconsole.log(list.length) // 5\n\n// Elements are taken in order: [1, 2, 3, 4, 5]\nconsole.log(MutableList.takeAll(list)) // [1, 2, 3, 4, 5]\n\n// Works with any iterable\nconst newList = MutableList.make<string>()\nMutableList.prependAll(newList, "hello") // Prepends each character\nconsole.log(MutableList.takeAll(newList)) // ["h", "e", "l", "l", "o"]';
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
