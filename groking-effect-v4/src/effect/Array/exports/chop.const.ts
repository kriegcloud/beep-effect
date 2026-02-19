/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: chop
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Repeatedly applies a function that consumes a prefix of the array and produces a value plus the remaining elements, collecting the values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.chop(
 *   [1, 2, 3, 4, 5],
 *   (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]
 * )
 * console.log(result) // [2, 4, 6, 8, 10]
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
const exportName = "chop";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Repeatedly applies a function that consumes a prefix of the array and produces a value plus the remaining elements, collecting the values.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.chop(\n  [1, 2, 3, 4, 5],\n  (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]\n)\nconsole.log(result) // [2, 4, 6, 8, 10]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4, 5];
  const result = A.chop(input, (as): readonly [number, ReadonlyArray<number>] => [as[0] * 2, as.slice(1)]);

  yield* Console.log(`chop([1, 2, 3, 4, 5], step) => ${JSON.stringify(result)}`);
  yield* Console.log(`input remains ${JSON.stringify(input)}`);
});

const exampleCurriedPairSummaries = Effect.gen(function* () {
  const sumPairs = A.chop((as: A.NonEmptyReadonlyArray<number>): readonly [number, ReadonlyArray<number>] => {
    const chunk = as.slice(0, 2);
    const sum = chunk.reduce((total, value) => total + value, 0);
    return [sum, as.slice(chunk.length)];
  });
  const result = sumPairs([1, 2, 3, 4, 5]);

  yield* Console.log(`chop(sumPairs)([1, 2, 3, 4, 5]) => ${JSON.stringify(result)}`);
  yield* Console.log("Consumes up to 2 elements per step; the tail is handled in the final step.");
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
      description: "Run the same call shape shown in the source example to double each element.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Pair Summaries",
      description: "Use data-last chop to consume two elements at a time and emit per-step sums.",
      run: exampleCurriedPairSummaries,
    },
  ],
});

BunRuntime.runMain(program);
