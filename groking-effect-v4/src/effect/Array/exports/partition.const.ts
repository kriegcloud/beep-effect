/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: partition
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Splits an iterable into two arrays: elements that fail the predicate and elements that satisfy it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.partition([1, 2, 3, 4], (n) => n % 2 === 0)) // [[1, 3], [2, 4]]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "partition";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Splits an iterable into two arrays: elements that fail the predicate and elements that satisfy it.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.partition([1, 2, 3, 4], (n) => n % 2 === 0)) // [[1, 3], [2, 4]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4];
  const [odds, evens] = A.partition(input, (n) => n % 2 === 0);

  yield* Console.log(`A.partition([1, 2, 3, 4], n => n % 2 === 0) => ${JSON.stringify([odds, evens])}`);
  yield* Console.log(`excluded (predicate false) => ${JSON.stringify(odds)}`);
  yield* Console.log(`satisfying (predicate true) => ${JSON.stringify(evens)}`);
});

const exampleCurriedIndexPredicate = Effect.gen(function* () {
  const partitionByEvenIndex = A.partition((_, index) => index % 2 === 0);
  const [oddIndexValues, evenIndexValues] = partitionByEvenIndex([10, 11, 12, 13, 14]);

  yield* Console.log(
    `A.partition((_, i) => i % 2 === 0)([10, 11, 12, 13, 14]) => ${JSON.stringify([oddIndexValues, evenIndexValues])}`
  );
});

const exampleRefinementPartition = Effect.gen(function* () {
  const mixed: ReadonlyArray<number | string> = [0, "one", 2, "three", 4];
  const [strings, numbers] = A.partition(mixed, (value): value is number => typeof value === "number");

  yield* Console.log(`A.partition(mixed, isNumber) => ${JSON.stringify([strings, numbers])}`);
  yield* Console.log(`strings => ${JSON.stringify(strings)}, numbers => ${JSON.stringify(numbers)}`);
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
      title: "Source-Aligned Invocation",
      description: "Partition odds and evens using the same data-first call shape as the JSDoc example.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Index Predicate",
      description: "Reuse a data-last partition function and route values by index parity.",
      run: exampleCurriedIndexPredicate,
    },
    {
      title: "Refinement Partition",
      description: "Split mixed values with a type-refining predicate to separate strings and numbers.",
      run: exampleRefinementPartition,
    },
  ],
});

BunRuntime.runMain(program);
