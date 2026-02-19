/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Apply a function to pairs of elements at the same index in two `Iterable`s, collecting the results. If one input `Iterable` is short, excess elements of the longer `Iterable` are discarded.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Add corresponding elements
 * const a = [1, 2, 3, 4]
 * const b = [10, 20, 30, 40]
 * const sums = Iterable.zipWith(a, b, (x, y) => x + y)
 * console.log(Array.from(sums)) // [11, 22, 33, 44]
 *
 * // Combine strings
 * const firstNames = ["John", "Jane", "Bob"]
 * const lastNames = ["Doe", "Smith", "Johnson"]
 * const fullNames = Iterable.zipWith(
 *   firstNames,
 *   lastNames,
 *   (first, last) => `${first} ${last}`
 * )
 * console.log(Array.from(fullNames)) // ["John Doe", "Jane Smith", "Bob Johnson"]
 *
 * // Different lengths - stops at shorter
 * const short = [1, 2]
 * const long = ["a", "b", "c", "d"]
 * const combined = Iterable.zipWith(
 *   short,
 *   long,
 *   (num, letter) => `${num}${letter}`
 * )
 * console.log(Array.from(combined)) // ["1a", "2b"]
 *
 * // Complex transformations
 * const prices = [10.99, 25.50, 5.00]
 * const quantities = [2, 1, 3]
 * const totals = Iterable.zipWith(prices, quantities, (price, qty) => {
 *   return Math.round(price * qty * 100) / 100 // round to 2 decimal places
 * })
 * console.log(Array.from(totals)) // [21.98, 25.5, 15]
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Apply a function to pairs of elements at the same index in two `Iterable`s, collecting the results. If one input `Iterable` is short, excess elements of the longer `Iterable` ar...";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Add corresponding elements\nconst a = [1, 2, 3, 4]\nconst b = [10, 20, 30, 40]\nconst sums = Iterable.zipWith(a, b, (x, y) => x + y)\nconsole.log(Array.from(sums)) // [11, 22, 33, 44]\n\n// Combine strings\nconst firstNames = ["John", "Jane", "Bob"]\nconst lastNames = ["Doe", "Smith", "Johnson"]\nconst fullNames = Iterable.zipWith(\n  firstNames,\n  lastNames,\n  (first, last) => `${first} ${last}`\n)\nconsole.log(Array.from(fullNames)) // ["John Doe", "Jane Smith", "Bob Johnson"]\n\n// Different lengths - stops at shorter\nconst short = [1, 2]\nconst long = ["a", "b", "c", "d"]\nconst combined = Iterable.zipWith(\n  short,\n  long,\n  (num, letter) => `${num}${letter}`\n)\nconsole.log(Array.from(combined)) // ["1a", "2b"]\n\n// Complex transformations\nconst prices = [10.99, 25.50, 5.00]\nconst quantities = [2, 1, 3]\nconst totals = Iterable.zipWith(prices, quantities, (price, qty) => {\n  return Math.round(price * qty * 100) / 100 // round to 2 decimal places\n})\nconsole.log(Array.from(totals)) // [21.98, 25.5, 15]';
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
