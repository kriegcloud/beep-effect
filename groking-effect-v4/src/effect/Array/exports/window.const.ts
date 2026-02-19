/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: window
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Creates overlapping sliding windows of size `n`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.window([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 * console.log(Array.window([1, 2, 3, 4, 5], 6)) // []
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
const exportName = "window";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates overlapping sliding windows of size `n`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.window([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]\nconsole.log(Array.window([1, 2, 3, 4, 5], 6)) // []';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedWindowing = Effect.gen(function* () {
  const values = [1, 2, 3, 4, 5];
  const windows = A.window(values, 3);

  yield* Console.log(`window([1, 2, 3, 4, 5], 3) -> ${JSON.stringify(windows)}`);
  yield* Console.log(`window count -> ${windows.length}`);
});

const exampleBoundaryWindowSizes = Effect.gen(function* () {
  const values = ["A", "B", "C", "D"];
  const exactFit = A.window(values, 4);
  const tooLarge = A.window(values, 5);

  yield* Console.log(`window(["A", "B", "C", "D"], 4) -> ${JSON.stringify(exactFit)}`);
  yield* Console.log(`window(["A", "B", "C", "D"], 5) -> ${JSON.stringify(tooLarge)}`);
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
      title: "Source-Aligned Windowing",
      description: "Create overlapping windows of size 3 using the documented two-argument call form.",
      run: exampleSourceAlignedWindowing,
    },
    {
      title: "Boundary Window Sizes",
      description: "Show exact-fit output and the empty result when the requested window exceeds input length.",
      run: exampleBoundaryWindowSizes,
    },
  ],
});

BunRuntime.runMain(program);
