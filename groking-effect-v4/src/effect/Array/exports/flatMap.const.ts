/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Maps each element to an array and flattens the results into a single array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.flatMap([1, 2, 3], (x) => [x, x * 2])) // [1, 2, 2, 4, 3, 6]
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Maps each element to an array and flattens the results into a single array.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.flatMap([1, 2, 3], (x) => [x, x * 2])) // [1, 2, 2, 4, 3, 6]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFlatMap = Effect.gen(function* () {
  const result = A.flatMap([1, 2, 3], (x) => [x, x * 2]);

  yield* Console.log(`flatMap([1,2,3], x => [x, x * 2]) => ${JSON.stringify(result)}`);
});

const exampleCurriedIndexAwareFlatMap = Effect.gen(function* () {
  const expandWithIndex = (value: number, index: number): ReadonlyArray<number> => [value, index];
  const result = A.flatMap(expandWithIndex)([10, 20, 30]);

  yield* Console.log(`flatMap((value, index) => [value, index])([10,20,30]) => ${JSON.stringify(result)}`);
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
      description: "Map each number to two outputs and flatten the mapped arrays in order.",
      run: exampleSourceAlignedFlatMap,
    },
    {
      title: "Curried Index-Aware Invocation",
      description: "Use the curried form to show callback index participation in flattened output.",
      run: exampleCurriedIndexAwareFlatMap,
    },
  ],
});

BunRuntime.runMain(program);
