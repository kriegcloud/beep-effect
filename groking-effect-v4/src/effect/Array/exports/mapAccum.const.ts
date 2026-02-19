/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: mapAccum
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])
 * console.log(result) // [6, [1, 3, 6]]
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
const exportName = "mapAccum";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])\nconsole.log(result) // [6, [1, 3, 6]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview before running behavior examples.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedRunningTotals = Effect.gen(function* () {
  const input = [1, 2, 3];
  const [finalState, runningTotals] = A.mapAccum(input, 0, (sum, n) => {
    const next = sum + n;
    return [next, next] as const;
  });

  yield* Console.log(`A.mapAccum([1,2,3], 0, sum) => [${finalState}, ${JSON.stringify(runningTotals)}]`);
  yield* Console.log(`input remains ${JSON.stringify(input)}`);
});

const exampleDataLastWithIndexLabels = Effect.gen(function* () {
  const numberWords = ["one", "two", "three"];
  const mapWithLabelState = A.mapAccum(0, (count, word, index) => {
    const value = typeof word === "string" ? word : String(word);
    return [count + 1, `${index}:${value.toUpperCase()}`] as const;
  });
  const [processedCount, labels] = mapWithLabelState(numberWords);

  yield* Console.log(`A.mapAccum(0, f)(["one","two","three"]) => [${processedCount}, ${JSON.stringify(labels)}]`);
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
      title: "Source-Aligned Running Totals",
      description: "Use data-first mapAccum to compute cumulative sums and return each running total.",
      run: exampleSourceAlignedRunningTotals,
    },
    {
      title: "Data-Last With Index Labels",
      description: "Use the curried form and callback index to build stable labels while counting processed items.",
      run: exampleDataLastWithIndexLabels,
    },
  ],
});

BunRuntime.runMain(program);
