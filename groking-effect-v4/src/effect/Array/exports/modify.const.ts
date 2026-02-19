/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Applies a function to the element at the specified index, returning a new array, or `undefined` if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.modify([1, 2, 3, 4], 2, (n) => n * 2)) // [1, 2, 6, 4]
 * console.log(Array.modify([1, 2, 3, 4], 5, (n) => n * 2)) // undefined
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Applies a function to the element at the specified index, returning a new array, or `undefined` if the index is out of bounds.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.modify([1, 2, 3, 4], 2, (n) => n * 2)) // [1, 2, 6, 4]\nconsole.log(Array.modify([1, 2, 3, 4], 5, (n) => n * 2)) // undefined';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the modify export runtime shape before using it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4];
  const modified = A.modify(input, 2, (n) => n * 2);
  const outOfBounds = A.modify(input, 5, (n) => n * 2);

  yield* Console.log(`A.modify([1, 2, 3, 4], 2, n => n * 2) => ${formatUnknown(modified)}`);
  yield* Console.log(`A.modify([1, 2, 3, 4], 5, n => n * 2) => ${formatUnknown(outOfBounds)}`);
  yield* Console.log(`Original input remains => ${formatUnknown(input)}`);
});

const exampleCurriedInvocation = Effect.gen(function* () {
  const modifyIndexOne = A.modify(1, (n) => (typeof n === "number" ? n + 100 : Number(n) + 100));
  const fromSet = modifyIndexOne(new Set([10, 20, 30]));
  const tooShort = modifyIndexOne([9]);

  yield* Console.log(`A.modify(1, n => n + 100)(Set(10, 20, 30)) => ${formatUnknown(fromSet)}`);
  yield* Console.log(`A.modify(1, n => n + 100)([9]) => ${formatUnknown(tooShort)}`);
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
      description: "Modify an in-range index and show the out-of-bounds `undefined` contract.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable Invocation",
      description: "Use data-last form with iterable input and verify short-input behavior.",
      run: exampleCurriedInvocation,
    },
  ],
});

BunRuntime.runMain(program);
