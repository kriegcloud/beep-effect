/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: groupWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Group equal, consecutive elements of an `Iterable` into `NonEmptyArray`s using the provided `isEquivalent` function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Group consecutive equal numbers
 * const numbers = [1, 1, 2, 2, 2, 3, 1, 1]
 * const grouped = Iterable.groupWith(numbers, (a, b) => a === b)
 * console.log(Array.from(grouped))
 * // [[1, 1], [2, 2, 2], [3], [1, 1]]
 *
 * // Case-insensitive grouping of strings
 * const words = ["Apple", "APPLE", "banana", "Banana", "cherry"]
 * const caseInsensitive = (a: string, b: string) =>
 *   a.toLowerCase() === b.toLowerCase()
 * const groupedWords = Iterable.groupWith(words, caseInsensitive)
 * console.log(Array.from(groupedWords))
 * // [["Apple", "APPLE"], ["banana", "Banana"], ["cherry"]]
 *
 * // Group by approximate equality
 * const floats = [1.1, 1.12, 1.9, 2.01, 2.05, 3.5]
 * const approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.2
 * const groupedFloats = Iterable.groupWith(floats, approxEqual)
 * console.log(Array.from(groupedFloats))
 * // [[1.1, 1.12], [1.9, 2.01, 2.05], [3.5]]
 *
 * // Only groups consecutive elements
 * const scattered = [1, 2, 1, 2, 1]
 * const scatteredGroups = Iterable.groupWith(scattered, (a, b) => a === b)
 * console.log(Array.from(scatteredGroups))
 * // [[1], [2], [1], [2], [1]] (no grouping since none are consecutive)
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "groupWith";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Group equal, consecutive elements of an `Iterable` into `NonEmptyArray`s using the provided `isEquivalent` function.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Group consecutive equal numbers\nconst numbers = [1, 1, 2, 2, 2, 3, 1, 1]\nconst grouped = Iterable.groupWith(numbers, (a, b) => a === b)\nconsole.log(Array.from(grouped))\n// [[1, 1], [2, 2, 2], [3], [1, 1]]\n\n// Case-insensitive grouping of strings\nconst words = ["Apple", "APPLE", "banana", "Banana", "cherry"]\nconst caseInsensitive = (a: string, b: string) =>\n  a.toLowerCase() === b.toLowerCase()\nconst groupedWords = Iterable.groupWith(words, caseInsensitive)\nconsole.log(Array.from(groupedWords))\n// [["Apple", "APPLE"], ["banana", "Banana"], ["cherry"]]\n\n// Group by approximate equality\nconst floats = [1.1, 1.12, 1.9, 2.01, 2.05, 3.5]\nconst approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.2\nconst groupedFloats = Iterable.groupWith(floats, approxEqual)\nconsole.log(Array.from(groupedFloats))\n// [[1.1, 1.12], [1.9, 2.01, 2.05], [3.5]]\n\n// Only groups consecutive elements\nconst scattered = [1, 2, 1, 2, 1]\nconst scatteredGroups = Iterable.groupWith(scattered, (a, b) => a === b)\nconsole.log(Array.from(scatteredGroups))\n// [[1], [2], [1], [2], [1]] (no grouping since none are consecutive)';
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
