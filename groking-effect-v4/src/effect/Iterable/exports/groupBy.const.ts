/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: groupBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.170Z
 *
 * Overview:
 * Splits an `Iterable` into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning function on each element, and grouping the results according to values returned
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Group by string length
 * const words = ["a", "bb", "ccc", "dd", "eee", "f"]
 * const byLength = Iterable.groupBy(words, (word) => word.length.toString())
 * console.log(byLength)
 * // { "1": ["a", "f"], "2": ["bb", "dd"], "3": ["ccc", "eee"] }
 *
 * // Group by first letter
 * const names = ["Alice", "Bob", "Charlie", "David", "Anna", "Betty"]
 * const byFirstLetter = Iterable.groupBy(names, (name) => name[0])
 * console.log(byFirstLetter)
 * // { "A": ["Alice", "Anna"], "B": ["Bob", "Betty"], "C": ["Charlie"], "D": ["David"] }
 *
 * // Group by category
 * const items = [
 *   { name: "apple", category: "fruit" },
 *   { name: "carrot", category: "vegetable" },
 *   { name: "banana", category: "fruit" },
 *   { name: "broccoli", category: "vegetable" }
 * ]
 * const byCategory = Iterable.groupBy(items, (item) => item.category)
 * console.log(byCategory)
 * // {
 * //   "fruit": [{ name: "apple", category: "fruit" }, { name: "banana", category: "fruit" }],
 * //   "vegetable": [{ name: "carrot", category: "vegetable" }, { name: "broccoli", category: "vegetable" }]
 * // }
 *
 * // Group numbers by even/odd
 * const numbers = [1, 2, 3, 4, 5, 6]
 * const evenOdd = Iterable.groupBy(numbers, (n) => n % 2 === 0 ? "even" : "odd")
 * console.log(evenOdd)
 * // { "odd": [1, 3, 5], "even": [2, 4, 6] }
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "groupBy";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Splits an `Iterable` into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning function on each element, and grouping the results accord...";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Group by string length\nconst words = ["a", "bb", "ccc", "dd", "eee", "f"]\nconst byLength = Iterable.groupBy(words, (word) => word.length.toString())\nconsole.log(byLength)\n// { "1": ["a", "f"], "2": ["bb", "dd"], "3": ["ccc", "eee"] }\n\n// Group by first letter\nconst names = ["Alice", "Bob", "Charlie", "David", "Anna", "Betty"]\nconst byFirstLetter = Iterable.groupBy(names, (name) => name[0])\nconsole.log(byFirstLetter)\n// { "A": ["Alice", "Anna"], "B": ["Bob", "Betty"], "C": ["Charlie"], "D": ["David"] }\n\n// Group by category\nconst items = [\n  { name: "apple", category: "fruit" },\n  { name: "carrot", category: "vegetable" },\n  { name: "banana", category: "fruit" },\n  { name: "broccoli", category: "vegetable" }\n]\nconst byCategory = Iterable.groupBy(items, (item) => item.category)\nconsole.log(byCategory)\n// {\n//   "fruit": [{ name: "apple", category: "fruit" }, { name: "banana", category: "fruit" }],\n//   "vegetable": [{ name: "carrot", category: "vegetable" }, { name: "broccoli", category: "vegetable" }]\n// }\n\n// Group numbers by even/odd\nconst numbers = [1, 2, 3, 4, 5, 6]\nconst evenOdd = Iterable.groupBy(numbers, (n) => n % 2 === 0 ? "even" : "odd")\nconsole.log(evenOdd)\n// { "odd": [1, 3, 5], "even": [2, 4, 6] }';
const moduleRecord = IterableModule as Record<string, unknown>;

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
