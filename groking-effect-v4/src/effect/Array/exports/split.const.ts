/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: split
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Splits an iterable into `n` roughly equal-sized chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.split([1, 2, 3, 4, 5, 6, 7, 8], 3)) // [[1, 2, 3], [4, 5, 6], [7, 8]]
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
const exportName = "split";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Splits an iterable into `n` roughly equal-sized chunks.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.split([1, 2, 3, 4, 5, 6, 7, 8], 3)) // [[1, 2, 3], [4, 5, 6], [7, 8]]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSplit = Effect.gen(function* () {
  const values = [1, 2, 3, 4, 5, 6, 7, 8];
  const groups = A.split(values, 3);
  const groupSizes = groups.map((group) => group.length);

  yield* Console.log(`split([1, 2, 3, 4, 5, 6, 7, 8], 3) -> ${JSON.stringify(groups)}`);
  yield* Console.log(`group sizes -> [${groupSizes.join(", ")}]`);
});

const exampleCurriedSplitAndHighGroupCount = Effect.gen(function* () {
  const splitIntoFour = A.split(4);
  const taskBatches = splitIntoFour(new Set(["ingest", "validate", "enrich", "store", "publish", "notify"]));
  const oversizedGroupCount = A.split(["a", "b", "c", "d"], 8);

  yield* Console.log(`split(4)(Set tasks) -> ${JSON.stringify(taskBatches)}`);
  yield* Console.log(`split(["a", "b", "c", "d"], 8) -> ${JSON.stringify(oversizedGroupCount)}`);
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
      description: "Split eight values into three groups and inspect how the remainder is distributed.",
      run: exampleSourceAlignedSplit,
    },
    {
      title: "Curried Split And High Group Count",
      description: "Use the curried form with a Set and observe behavior when target groups exceed input length.",
      run: exampleCurriedSplitAndHighGroupCount,
    },
  ],
});

BunRuntime.runMain(program);
