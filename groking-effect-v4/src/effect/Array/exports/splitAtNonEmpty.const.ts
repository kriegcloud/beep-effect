/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: splitAtNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Splits a non-empty array into two parts at the given index. The first part is guaranteed to be non-empty (`n` is clamped to >= 1).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))
 * // [["a", "b", "c"], ["d", "e"]]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "splitAtNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Splits a non-empty array into two parts at the given index. The first part is guaranteed to be non-empty (`n` is clamped to >= 1).";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))\n// [["a", "b", "c"], ["d", "e"]]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSplit = Effect.gen(function* () {
  const input = ["a", "b", "c", "d", "e"] as const;
  const result = A.splitAtNonEmpty(input, 3);

  yield* Console.log(`A.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3) => ${formatUnknown(result)}`);
});

const exampleClampAndFloorBehavior = Effect.gen(function* () {
  const input = ["alpha", "beta", "gamma"] as const;
  const clampedToOne = A.splitAtNonEmpty(input, 0);
  const flooredIndex = A.splitAtNonEmpty(input, 2.9);

  yield* Console.log(`n = 0 clamps to 1 => ${formatUnknown(clampedToOne)}`);
  yield* Console.log(`n = 2.9 floors to 2 => ${formatUnknown(flooredIndex)}`);
});

const exampleCurriedOversizedIndex = Effect.gen(function* () {
  const input: readonly [string, ...string[]] = ["todo", "doing"];
  const splitAtTen = A.splitAtNonEmpty(10);
  const result = splitAtTen(input);
  const inputAsReadonlyArray: ReadonlyArray<string> = input;

  yield* Console.log(`A.splitAtNonEmpty(10)(["todo", "doing"]) => ${formatUnknown(result)}`);
  yield* Console.log(`left side is a copy of input: ${result[0] !== inputAsReadonlyArray}`);
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
      title: "Source-Aligned Split",
      description: "Split at index 3 exactly as shown in the module documentation.",
      run: exampleSourceAlignedSplit,
    },
    {
      title: "Clamp + Floor Behavior",
      description: "Show how `n` is normalized with `Math.max(1, Math.floor(n))`.",
      run: exampleClampAndFloorBehavior,
    },
    {
      title: "Curried + Oversized Index",
      description: "Use data-last style and show that oversized indices return `[copy(input), []]`.",
      run: exampleCurriedOversizedIndex,
    },
  ],
});

BunRuntime.runMain(program);
