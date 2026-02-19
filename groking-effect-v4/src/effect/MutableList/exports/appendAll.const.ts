/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: appendAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Appends all elements from an iterable to the end of the MutableList. Returns the number of elements added.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 * 
 * const list = MutableList.make<number>()
 * MutableList.append(list, 1)
 * MutableList.append(list, 2)
 * 
 * // Append multiple elements
 * const added = MutableList.appendAll(list, [3, 4, 5])
 * console.log(added) // 3
 * console.log(list.length) // 5
 * 
 * // Elements maintain order: [1, 2, 3, 4, 5]
 * console.log(MutableList.takeAll(list)) // [1, 2, 3, 4, 5]
 * 
 * // Works with any iterable
 * const newList = MutableList.make<string>()
 * MutableList.appendAll(newList, new Set(["a", "b", "c"]))
 * console.log(MutableList.takeAll(newList)) // ["a", "b", "c"]
 * 
 * // Useful for bulk loading
 * const bulkList = MutableList.make<number>()
 * const count = MutableList.appendAll(
 *   bulkList,
 *   Array.from({ length: 1000 }, (_, i) => i)
 * )
 * console.log(count) // 1000
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
const exportName = "appendAll";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary = "Appends all elements from an iterable to the end of the MutableList. Returns the number of elements added.";
const sourceExample = "import * as MutableList from \"effect/MutableList\"\n\nconst list = MutableList.make<number>()\nMutableList.append(list, 1)\nMutableList.append(list, 2)\n\n// Append multiple elements\nconst added = MutableList.appendAll(list, [3, 4, 5])\nconsole.log(added) // 3\nconsole.log(list.length) // 5\n\n// Elements maintain order: [1, 2, 3, 4, 5]\nconsole.log(MutableList.takeAll(list)) // [1, 2, 3, 4, 5]\n\n// Works with any iterable\nconst newList = MutableList.make<string>()\nMutableList.appendAll(newList, new Set([\"a\", \"b\", \"c\"]))\nconsole.log(MutableList.takeAll(newList)) // [\"a\", \"b\", \"c\"]\n\n// Useful for bulk loading\nconst bulkList = MutableList.make<number>()\nconst count = MutableList.appendAll(\n  bulkList,\n  Array.from({ length: 1000 }, (_, i) => i)\n)\nconsole.log(count) // 1000";
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
