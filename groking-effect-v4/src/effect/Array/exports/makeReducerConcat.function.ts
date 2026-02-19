/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: makeReducerConcat
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Returns a `Reducer` that combines `Array` values by concatenation.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducerConcat";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns a `Reducer` that combines `Array` values by concatenation.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleReducerCombineAll = Effect.gen(function* () {
  const reducer = A.makeReducerConcat<number>();
  const chunks: Array<Array<number>> = [[1, 2], [3], [4, 5]];
  const combined = reducer.combineAll(chunks);

  yield* Console.log(`initialValue starts empty: ${reducer.initialValue.length === 0}`);
  yield* Console.log(`combineAll([[1,2],[3],[4,5]]) -> ${JSON.stringify(combined)}`);
});

const exampleReducerBoundary = Effect.gen(function* () {
  const reducer = A.makeReducerConcat<string>();
  const left = ["beep", "boop"];
  const right = ["bop"];
  const emptyChunks: Array<Array<string>> = [];

  const pairCombined = reducer.combine(left, right);
  const emptyCombined = reducer.combineAll(emptyChunks);

  yield* Console.log(`combine(["beep","boop"],["bop"]) -> ${JSON.stringify(pairCombined)}`);
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
      title: "Reducer combineAll",
      description: "Create the reducer and concatenate array chunks in order.",
      run: exampleReducerCombineAll,
    },
    {
      title: "Boundary: Empty Input",
      description: "Contrast a non-empty combine call with combineAll on an empty collection.",
      run: exampleReducerBoundary,
    },
  ],
});

BunRuntime.runMain(program);
