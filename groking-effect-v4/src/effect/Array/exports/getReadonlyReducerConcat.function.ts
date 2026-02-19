/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: getReadonlyReducerConcat
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.350Z
 *
 * Overview:
 * Returns a `Reducer` that combines `ReadonlyArray` values by concatenation.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getReadonlyReducerConcat";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns a `Reducer` that combines `ReadonlyArray` values by concatenation.";
const sourceExample = "";
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before reducer usage.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleReducerCombineAll = Effect.gen(function* () {
  const reducer = A.getReadonlyReducerConcat<string>();
  const chunks: ReadonlyArray<ReadonlyArray<string>> = [["beep"], ["boop", "bop"], ["buzz"]];
  const combined = reducer.combineAll(chunks);

  yield* Console.log(`initialValue is empty: ${reducer.initialValue.length === 0}`);
  yield* Console.log(`combineAll(chunks) -> ${JSON.stringify(combined)}`);
});

const exampleReducerBoundary = Effect.gen(function* () {
  const reducer = A.getReadonlyReducerConcat<number>();
  const left: ReadonlyArray<number> = [1, 2];
  const right: ReadonlyArray<number> = [3, 4];
  const emptyChunks: ReadonlyArray<ReadonlyArray<number>> = [];

  const pairCombined = reducer.combine(left, right);
  const emptyCombined = reducer.combineAll(emptyChunks);

  yield* Console.log(`combine([1,2],[3,4]) -> ${JSON.stringify(pairCombined)}`);
  yield* Console.log(`combineAll([]) -> ${JSON.stringify(emptyCombined)}`);
  yield* Console.log(`empty result reuses reducer.initialValue: ${Object.is(emptyCombined, reducer.initialValue)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Reducer combineAll",
      description: "Create the reducer and concatenate readonly chunks in order.",
      run: exampleReducerCombineAll,
    },
    {
      title: "Boundary: Empty Input",
      description: "Contrast non-empty combine with combineAll on an empty collection.",
      run: exampleReducerBoundary,
    },
  ],
});

BunRuntime.runMain(program);
