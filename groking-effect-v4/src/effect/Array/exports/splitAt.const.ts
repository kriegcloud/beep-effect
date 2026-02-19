/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: splitAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Splits an iterable into two arrays at the given index.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitAt([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [4, 5]]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "splitAt";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Splits an iterable into two arrays at the given index.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.splitAt([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [4, 5]]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSplitAt = Effect.gen(function* () {
  const input = [1, 2, 3, 4, 5];
  const [before, after] = A.splitAt(input, 3);

  yield* Console.log(`splitAt([1, 2, 3, 4, 5], 3) -> ${JSON.stringify([before, after])}`);
  yield* Console.log(`segment sizes -> [${before.length}, ${after.length}]`);
});

const exampleCurriedAndBoundarySplitAt = Effect.gen(function* () {
  const splitAtTwo = A.splitAt(2);
  const fromSet = splitAtTwo(new Set(["ingest", "validate", "persist", "notify"]));
  const splitAtZero = A.splitAt(["a", "b", "c"], 0);
  const splitPastEnd = A.splitAt(["a", "b", "c"], 10);

  yield* Console.log(`splitAt(2)(Set tasks) -> ${JSON.stringify(fromSet)}`);
  yield* Console.log(`splitAt(["a", "b", "c"], 0) -> ${JSON.stringify(splitAtZero)}`);
  yield* Console.log(`splitAt(["a", "b", "c"], 10) -> ${JSON.stringify(splitPastEnd)}`);
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
      title: "Source-Aligned Split At",
      description: "Split five values at index three and inspect both resulting segments.",
      run: exampleSourceAlignedSplitAt,
    },
    {
      title: "Curried Form + Boundaries",
      description: "Use data-last style on an iterable and observe index boundaries at 0 and beyond input length.",
      run: exampleCurriedAndBoundarySplitAt,
    },
  ],
});

BunRuntime.runMain(program);
