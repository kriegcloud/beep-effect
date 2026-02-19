/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: zip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Pairs elements from two iterables by position. If the iterables differ in length, the extra elements from the longer one are discarded.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]
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
const exportName = "zip";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Pairs elements from two iterables by position. If the iterables differ in length, the extra elements from the longer one are discarded.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const numbers = [1, 2, 3];
  const labels = ["a", "b"];
  const zipped = A.zip(numbers, labels);

  yield* Console.log(`zip([1,2,3], ["a","b"]) => ${JSON.stringify(zipped)}`);
});

const exampleDualAndLengthBehavior = Effect.gen(function* () {
  const zipWithLetters = A.zip(["x", "y", "z"]);
  const curriedResult = zipWithLetters([10, 20]);
  const longerRight = A.zip([1, 2], ["a", "b", "c"]);
  const longerLeft = A.zip([1, 2, 3, 4], ["a"]);

  yield* Console.log(`zip(["x","y","z"])([10,20]) => ${JSON.stringify(curriedResult)}`);
  yield* Console.log(`zip([1,2], ["a","b","c"]) => ${JSON.stringify(longerRight)}`);
  yield* Console.log(`zip([1,2,3,4], ["a"]) => ${JSON.stringify(longerLeft)}`);
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
      title: "Source-Aligned Invocation",
      description: "Zip two arrays by index using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Dual Form and Truncation Behavior",
      description: "Show curried usage and how zip truncates to the shorter input.",
      run: exampleDualAndLengthBehavior,
    },
  ],
});

BunRuntime.runMain(program);
