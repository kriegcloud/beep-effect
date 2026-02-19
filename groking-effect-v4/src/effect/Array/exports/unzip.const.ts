/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: unzip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Splits an array of pairs into two arrays. Inverse of {@link zip}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.unzip([[1, "a"], [2, "b"], [3, "c"]])) // [[1, 2, 3], ["a", "b", "c"]]
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
const exportName = "unzip";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Splits an array of pairs into two arrays. Inverse of {@link zip}.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.unzip([[1, "a"], [2, "b"], [3, "c"]])) // [[1, 2, 3], ["a", "b", "c"]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata for Array.unzip.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedSplit = Effect.gen(function* () {
  const pairs: ReadonlyArray<readonly [number, string]> = [
    [1, "a"],
    [2, "b"],
    [3, "c"],
  ];
  const [numbers, letters] = A.unzip(pairs);

  yield* Console.log(`pairs=${JSON.stringify(pairs)}`);
  yield* Console.log(`unzip(pairs) -> numbers=${JSON.stringify(numbers)}, letters=${JSON.stringify(letters)}`);
});

const exampleZipInverseFlow = Effect.gen(function* () {
  const left = [10, 20, 30];
  const right = ["x", "y"];
  const zipped = A.zip(left, right);
  const [leftOut, rightOut] = A.unzip(zipped);

  yield* Console.log(`zip(left,right) -> ${JSON.stringify(zipped)}`);
  yield* Console.log(`unzip(zip(left,right)) -> left=${JSON.stringify(leftOut)}, right=${JSON.stringify(rightOut)}`);
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
      title: "Source-Aligned Pair Split",
      description: "Split the documented list of numeric/string pairs into parallel arrays.",
      run: exampleSourceAlignedSplit,
    },
    {
      title: "Zip Inverse Flow",
      description: "Show unzip reversing zip on produced pairs (including zip truncation behavior).",
      run: exampleZipInverseFlow,
    },
  ],
});

BunRuntime.runMain(program);
