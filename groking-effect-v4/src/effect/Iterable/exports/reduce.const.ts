/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.170Z
 *
 * Overview:
 * Reduce an iterable to a single value by applying a function to each element and accumulating the result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Sum all numbers
 * const numbers = [1, 2, 3, 4, 5]
 * const sum = Iterable.reduce(numbers, 0, (acc, n) => acc + n)
 * console.log(sum) // 15
 *
 * // Find maximum value
 * const values = [3, 1, 4, 1, 5, 9, 2]
 * const max = Iterable.reduce(values, -Infinity, Math.max)
 * console.log(max) // 9
 *
 * // Build an object from key-value pairs
 * const pairs = [["a", 1], ["b", 2], ["c", 3]] as const
 * const obj = Iterable.reduce(
 *   pairs,
 *   {} as Record<string, number>,
 *   (acc, [key, value]) => {
 *     acc[key] = value
 *     return acc
 *   }
 * )
 * console.log(obj) // { a: 1, b: 2, c: 3 }
 *
 * // Use index in the reducer
 * const letters = ["a", "b", "c"]
 * const indexed = Iterable.reduce(
 *   letters,
 *   [] as Array<string>,
 *   (acc, letter, i) => {
 *     acc.push(`${i}: ${letter}`)
 *     return acc
 *   }
 * )
 * console.log(indexed) // ["0: a", "1: b", "2: c"]
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
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Reduce an iterable to a single value by applying a function to each element and accumulating the result.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Sum all numbers\nconst numbers = [1, 2, 3, 4, 5]\nconst sum = Iterable.reduce(numbers, 0, (acc, n) => acc + n)\nconsole.log(sum) // 15\n\n// Find maximum value\nconst values = [3, 1, 4, 1, 5, 9, 2]\nconst max = Iterable.reduce(values, -Infinity, Math.max)\nconsole.log(max) // 9\n\n// Build an object from key-value pairs\nconst pairs = [["a", 1], ["b", 2], ["c", 3]] as const\nconst obj = Iterable.reduce(\n  pairs,\n  {} as Record<string, number>,\n  (acc, [key, value]) => {\n    acc[key] = value\n    return acc\n  }\n)\nconsole.log(obj) // { a: 1, b: 2, c: 3 }\n\n// Use index in the reducer\nconst letters = ["a", "b", "c"]\nconst indexed = Iterable.reduce(\n  letters,\n  [] as Array<string>,\n  (acc, letter, i) => {\n    acc.push(`${i}: ${letter}`)\n    return acc\n  }\n)\nconsole.log(indexed) // ["0: a", "1: b", "2: c"]';
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
