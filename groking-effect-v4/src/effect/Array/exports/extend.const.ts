/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: extend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Applies a function to each suffix of the array (starting from each index), collecting the results.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.extend([1, 2, 3], (as) => as.length)) // [3, 2, 1]
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
const exportName = "extend";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Applies a function to each suffix of the array (starting from each index), collecting the results.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.extend([1, 2, 3], (as) => as.length)) // [3, 2, 1]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedSuffixLengths = Effect.gen(function* () {
  const result = A.extend([1, 2, 3], (as) => as.length);
  yield* Console.log(`extend([1,2,3], (as) => as.length) => ${JSON.stringify(result)}`);
});

const exampleCurriedSuffixAggregation = Effect.gen(function* () {
  const suffixSum = A.extend((as: ReadonlyArray<number>) => as.reduce((sum, n) => sum + n, 0));
  const sums = suffixSum([10, 20, 30, 40]);
  const emptyInput = suffixSum([]);

  yield* Console.log(`extend(sumSuffix)([10,20,30,40]) => ${JSON.stringify(sums)}`);
  yield* Console.log(`extend(sumSuffix)([]) => ${JSON.stringify(emptyInput)}`);
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
      title: "Source-Aligned Suffix Lengths",
      description: "Apply the callback to each suffix, matching the documented example.",
      run: exampleSourceAlignedSuffixLengths,
    },
    {
      title: "Curried Suffix Aggregation",
      description: "Use the curried form and aggregate each suffix into a deterministic sum.",
      run: exampleCurriedSuffixAggregation,
    },
  ],
});

BunRuntime.runMain(program);
