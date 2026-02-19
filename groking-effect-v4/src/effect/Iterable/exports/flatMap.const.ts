/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Applies a function to each element in an Iterable and returns a new Iterable containing the concatenated mapped elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Expand each number to a range
 * const numbers = [1, 2, 3]
 * const expanded = Iterable.flatMap(numbers, (n) => Iterable.range(1, n))
 * console.log(Array.from(expanded)) // [1, 1, 2, 1, 2, 3]
 *
 * // Split strings into characters
 * const words = ["hi", "bye"]
 * const chars = Iterable.flatMap(words, (word) => word)
 * console.log(Array.from(chars)) // ["h", "i", "b", "y", "e"]
 *
 * // Conditional expansion with empty iterables
 * const values = [1, 2, 3, 4, 5]
 * const evenMultiples = Iterable.flatMap(
 *   values,
 *   (n) => n % 2 === 0 ? [n, n * 2, n * 3] : []
 * )
 * console.log(Array.from(evenMultiples)) // [2, 4, 6, 4, 8, 12]
 *
 * // Use index in transformation
 * const letters = ["a", "b", "c"]
 * const indexed = Iterable.flatMap(
 *   letters,
 *   (letter, i) => Iterable.replicate(letter, i + 1)
 * )
 * console.log(Array.from(indexed)) // ["a", "b", "b", "c", "c", "c"]
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Applies a function to each element in an Iterable and returns a new Iterable containing the concatenated mapped elements.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Expand each number to a range\nconst numbers = [1, 2, 3]\nconst expanded = Iterable.flatMap(numbers, (n) => Iterable.range(1, n))\nconsole.log(Array.from(expanded)) // [1, 1, 2, 1, 2, 3]\n\n// Split strings into characters\nconst words = ["hi", "bye"]\nconst chars = Iterable.flatMap(words, (word) => word)\nconsole.log(Array.from(chars)) // ["h", "i", "b", "y", "e"]\n\n// Conditional expansion with empty iterables\nconst values = [1, 2, 3, 4, 5]\nconst evenMultiples = Iterable.flatMap(\n  values,\n  (n) => n % 2 === 0 ? [n, n * 2, n * 3] : []\n)\nconsole.log(Array.from(evenMultiples)) // [2, 4, 6, 4, 8, 12]\n\n// Use index in transformation\nconst letters = ["a", "b", "c"]\nconst indexed = Iterable.flatMap(\n  letters,\n  (letter, i) => Iterable.replicate(letter, i + 1)\n)\nconsole.log(Array.from(indexed)) // ["a", "b", "b", "c", "c", "c"]';
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
