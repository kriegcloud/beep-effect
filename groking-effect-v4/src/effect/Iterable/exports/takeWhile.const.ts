/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: takeWhile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Calculate the longest initial Iterable for which all element satisfy the specified predicate, creating a new `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [2, 4, 6, 8, 3, 10, 12]
 * const evenPrefix = Iterable.takeWhile(numbers, (x) => x % 2 === 0)
 * console.log(Array.from(evenPrefix)) // [2, 4, 6, 8]
 *
 * // With index
 * const letters = ["a", "b", "c", "d", "e"]
 * const firstThreeByIndex = Iterable.takeWhile(letters, (_, i) => i < 3)
 * console.log(Array.from(firstThreeByIndex)) // ["a", "b", "c"]
 *
 * // Stops at first non-matching element
 * const mixed = [1, 3, 5, 4, 7, 9]
 * const oddPrefix = Iterable.takeWhile(mixed, (x) => x % 2 === 1)
 * console.log(Array.from(oddPrefix)) // [1, 3, 5]
 *
 * // Type refinement
 * const values: Array<string | number> = ["a", "b", "c", 1, "d"]
 * const stringPrefix = Iterable.takeWhile(
 *   values,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(Array.from(stringPrefix)) // ["a", "b", "c"] (typed as string[])
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
const exportName = "takeWhile";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Calculate the longest initial Iterable for which all element satisfy the specified predicate, creating a new `Iterable`.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [2, 4, 6, 8, 3, 10, 12]\nconst evenPrefix = Iterable.takeWhile(numbers, (x) => x % 2 === 0)\nconsole.log(Array.from(evenPrefix)) // [2, 4, 6, 8]\n\n// With index\nconst letters = ["a", "b", "c", "d", "e"]\nconst firstThreeByIndex = Iterable.takeWhile(letters, (_, i) => i < 3)\nconsole.log(Array.from(firstThreeByIndex)) // ["a", "b", "c"]\n\n// Stops at first non-matching element\nconst mixed = [1, 3, 5, 4, 7, 9]\nconst oddPrefix = Iterable.takeWhile(mixed, (x) => x % 2 === 1)\nconsole.log(Array.from(oddPrefix)) // [1, 3, 5]\n\n// Type refinement\nconst values: Array<string | number> = ["a", "b", "c", 1, "d"]\nconst stringPrefix = Iterable.takeWhile(\n  values,\n  (x): x is string => typeof x === "string"\n)\nconsole.log(Array.from(stringPrefix)) // ["a", "b", "c"] (typed as string[])';
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
