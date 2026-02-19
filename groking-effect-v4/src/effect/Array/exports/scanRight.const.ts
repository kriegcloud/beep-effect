/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: scanRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Right-to-left fold that keeps every intermediate accumulator value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.scanRight([1, 2, 3, 4], 0, (acc, value) => acc + value)
 * console.log(result) // [10, 9, 7, 4, 0]
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
const exportName = "scanRight";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Right-to-left fold that keeps every intermediate accumulator value.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.scanRight([1, 2, 3, 4], 0, (acc, value) => acc + value)\nconsole.log(result) // [10, 9, 7, 4, 0]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedReverseRunningTotals = Effect.gen(function* () {
  const values = [1, 2, 3, 4];
  const reverseRunningTotals = A.scanRight(values, 0, (acc, value) => acc + value);

  yield* Console.log(`scanRight([1, 2, 3, 4], 0, +) -> ${JSON.stringify(reverseRunningTotals)}`);
  yield* Console.log(`output length = ${reverseRunningTotals.length} (input length + 1)`);
});

const exampleCurriedSuffixSnapshots = Effect.gen(function* () {
  const words = ["alpha", "beta", "gamma"];
  const scanSuffixes = A.scanRight(".", (acc: string, word: string) => `${word} ${acc}`);
  const suffixSnapshots = scanSuffixes(words);

  yield* Console.log(`scanRight(".", prepend word)(["alpha", "beta", "gamma"]) -> ${JSON.stringify(suffixSnapshots)}`);
  yield* Console.log(`each position keeps the suffix from that index to the seed`);
});

const exampleEmptyInputKeepsInitial = Effect.gen(function* () {
  const result = A.scanRight([] as ReadonlyArray<number>, 42, (acc, value) => acc + value);

  yield* Console.log(`scanRight([], 42, +) -> ${JSON.stringify(result)}`);
  yield* Console.log("empty input keeps only the initial accumulator value");
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
      title: "Source-Aligned Reverse Running Totals",
      description: "Run the documented call shape and confirm right-to-left accumulation.",
      run: exampleSourceAlignedReverseRunningTotals,
    },
    {
      title: "Curried Suffix Snapshots",
      description: "Use data-last form to keep every suffix-style intermediate accumulator.",
      run: exampleCurriedSuffixSnapshots,
    },
    {
      title: "Empty Input Keeps Initial",
      description: "Show that scanRight always returns a non-empty array containing the seed.",
      run: exampleEmptyInputKeepsInitial,
    },
  ],
});

BunRuntime.runMain(program);
