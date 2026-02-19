/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/NonEmptyIterable
 * Export: unprepend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/NonEmptyIterable.ts
 * Generated: 2026-02-19T04:50:37.863Z
 *
 * Overview:
 * Safely extracts the first element and remaining elements from a non-empty iterable.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * import * as Chunk from "effect/Chunk"
 * import * as NonEmptyIterable from "effect/NonEmptyIterable"
 *
 * // Helper to make iterator iterable for Array.from
 * const iteratorToIterable = <T>(iterator: Iterator<T>): Iterable<T> => ({
 *   [Symbol.iterator]() {
 *     return iterator
 *   }
 * })
 *
 * // With NonEmptyArray from Array.make (cast to NonEmptyIterable)
 * const numbers = Array.make(
 *   1,
 *   2,
 *   3,
 *   4,
 *   5
 * ) as unknown as NonEmptyIterable.NonEmptyIterable<number>
 * const [first, rest] = NonEmptyIterable.unprepend(numbers)
 * console.log(first) // 1
 * console.log(globalThis.Array.from(iteratorToIterable(rest))) // [2, 3, 4, 5]
 *
 * // With strings (assert when known to be non-empty)
 * const text = "hello" as unknown as NonEmptyIterable.NonEmptyIterable<string>
 * const [firstChar, restChars] = NonEmptyIterable.unprepend(text)
 * console.log(firstChar) // "h"
 * console.log(globalThis.Array.from(iteratorToIterable(restChars)).join("")) // "ello"
 *
 * // With Sets (assert when known to be non-empty)
 * const uniqueNumbers = new Set([
 *   10,
 *   20,
 *   30
 * ]) as unknown as NonEmptyIterable.NonEmptyIterable<number>
 * const [firstUnique, restUnique] = NonEmptyIterable.unprepend(uniqueNumbers)
 * console.log(firstUnique) // 10 (or any element, Set order is not guaranteed)
 * console.log(globalThis.Array.from(iteratorToIterable(restUnique))) // [20, 30] (in some order)
 *
 * // With Maps (assert when known to be non-empty)
 * const keyValuePairs = new Map([["a", 1], ["b", 2], [
 *   "c",
 *   3
 * ]]) as unknown as NonEmptyIterable.NonEmptyIterable<[string, number]>
 * const [firstPair, restPairs] = NonEmptyIterable.unprepend(keyValuePairs)
 * console.log(firstPair) // ["a", 1]
 * console.log(globalThis.Array.from(iteratorToIterable(restPairs))) // [["b", 2], ["c", 3]]
 *
 * // With custom generators
 * function* fibonacci(): Generator<number> {
 *   let a = 1, b = 1
 *   yield a
 *   for (let i = 0; i < 10; i++) {
 *     yield b
 *     const next = a + b
 *     a = b
 *     b = next
 *   }
 * }
 *
 * const generator = Chunk.fromIterable(
 *   fibonacci()
 * ) as unknown as NonEmptyIterable.NonEmptyIterable<number>
 * const [firstFib, restFib] = NonEmptyIterable.unprepend(generator)
 * console.log(firstFib) // 1
 * console.log(globalThis.Array.from(iteratorToIterable(restFib))) // [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
 *
 * // Practical usage: implementing reduce for non-empty iterables
 * function reduceNonEmpty<A, B>(
 *   data: NonEmptyIterable.NonEmptyIterable<A>,
 *   f: (acc: B, current: A) => B,
 *   initial: B
 * ): B {
 *   const [first, rest] = NonEmptyIterable.unprepend(data)
 *   let result = f(initial, first)
 *
 *   // Convert iterator to iterable for iteration
 *   const iterable = {
 *     [Symbol.iterator]() {
 *       return rest
 *     }
 *   }
 *   for (const item of iterable) {
 *     result = f(result, item)
 *   }
 *
 *   return result
 * }
 *
 * const data = Array.make(
 *   1,
 *   2,
 *   3,
 *   4
 * ) as unknown as NonEmptyIterable.NonEmptyIterable<number>
 * const sum = reduceNonEmpty(data, (acc, x) => acc + x, 0) // 10
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
import * as NonEmptyIterableModule from "effect/NonEmptyIterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "unprepend";
const exportKind = "const";
const moduleImportPath = "effect/NonEmptyIterable";
const sourceSummary = "Safely extracts the first element and remaining elements from a non-empty iterable.";
const sourceExample =
  'import { Array } from "effect"\nimport * as Chunk from "effect/Chunk"\nimport * as NonEmptyIterable from "effect/NonEmptyIterable"\n\n// Helper to make iterator iterable for Array.from\nconst iteratorToIterable = <T>(iterator: Iterator<T>): Iterable<T> => ({\n  [Symbol.iterator]() {\n    return iterator\n  }\n})\n\n// With NonEmptyArray from Array.make (cast to NonEmptyIterable)\nconst numbers = Array.make(\n  1,\n  2,\n  3,\n  4,\n  5\n) as unknown as NonEmptyIterable.NonEmptyIterable<number>\nconst [first, rest] = NonEmptyIterable.unprepend(numbers)\nconsole.log(first) // 1\nconsole.log(globalThis.Array.from(iteratorToIterable(rest))) // [2, 3, 4, 5]\n\n// With strings (assert when known to be non-empty)\nconst text = "hello" as unknown as NonEmptyIterable.NonEmptyIterable<string>\nconst [firstChar, restChars] = NonEmptyIterable.unprepend(text)\nconsole.log(firstChar) // "h"\nconsole.log(globalThis.Array.from(iteratorToIterable(restChars)).join("")) // "ello"\n\n// With Sets (assert when known to be non-empty)\nconst uniqueNumbers = new Set([\n  10,\n  20,\n  30\n]) as unknown as NonEmptyIterable.NonEmptyIterable<number>\nconst [firstUnique, restUnique] = NonEmptyIterable.unprepend(uniqueNumbers)\nconsole.log(firstUnique) // 10 (or any element, Set order is not guaranteed)\nconsole.log(globalThis.Array.from(iteratorToIterable(restUnique))) // [20, 30] (in some order)\n\n// With Maps (assert when known to be non-empty)\nconst keyValuePairs = new Map([["a", 1], ["b", 2], [\n  "c",\n  3\n]]) as unknown as NonEmptyIterable.NonEmptyIterable<[string, number]>\nconst [firstPair, restPairs] = NonEmptyIterable.unprepend(keyValuePairs)\nconsole.log(firstPair) // ["a", 1]\nconsole.log(globalThis.Array.from(iteratorToIterable(restPairs))) // [["b", 2], ["c", 3]]\n\n// With custom generators\nfunction* fibonacci(): Generator<number> {\n  let a = 1, b = 1\n  yield a\n  for (let i = 0; i < 10; i++) {\n    yield b\n    const next = a + b\n    a = b\n    b = next\n  }\n}\n\nconst generator = Chunk.fromIterable(\n  fibonacci()\n) as unknown as NonEmptyIterable.NonEmptyIterable<number>\nconst [firstFib, restFib] = NonEmptyIterable.unprepend(generator)\nconsole.log(firstFib) // 1\nconsole.log(globalThis.Array.from(iteratorToIterable(restFib))) // [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]\n\n// Practical usage: implementing reduce for non-empty iterables\nfunction reduceNonEmpty<A, B>(\n  data: NonEmptyIterable.NonEmptyIterable<A>,\n  f: (acc: B, current: A) => B,\n  initial: B\n): B {\n  const [first, rest] = NonEmptyIterable.unprepend(data)\n  let result = f(initial, first)\n\n  // Convert iterator to iterable for iteration\n  const iterable = {\n    [Symbol.iterator]() {\n      return rest\n    }\n  }\n  for (const item of iterable) {\n    result = f(result, item)\n  }\n\n  return result\n}\n\nconst data = Array.make(\n  1,\n  2,\n  3,\n  4\n) as unknown as NonEmptyIterable.NonEmptyIterable<number>\nconst sum = reduceNonEmpty(data, (acc, x) => acc + x, 0) // 10';
const moduleRecord = NonEmptyIterableModule as Record<string, unknown>;

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
