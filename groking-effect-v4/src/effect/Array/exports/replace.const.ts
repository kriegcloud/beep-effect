/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: replace
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Replaces the element at the specified index with a new value, returning a new array, or `undefined` if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.replace([1, 2, 3], 1, 4)) // [1, 4, 3]
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
const exportName = "replace";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Replaces the element at the specified index with a new value, returning a new array, or `undefined` if the index is out of bounds.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.replace([1, 2, 3], 1, 4)) // [1, 4, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the replace export runtime shape before using it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3];
  const replaced = A.replace(input, 1, 4);
  const outOfBounds = A.replace(input, 10, 99);
  const negativeIndex = A.replace(input, -1, 99);

  yield* Console.log(`A.replace([1, 2, 3], 1, 4) => ${formatUnknown(replaced)}`);
  yield* Console.log(`A.replace([1, 2, 3], 10, 99) => ${formatUnknown(outOfBounds)}`);
  yield* Console.log(`A.replace([1, 2, 3], -1, 99) => ${formatUnknown(negativeIndex)}`);
  yield* Console.log(`Original input remains => ${formatUnknown(input)}`);
});

const exampleCurriedIterableInvocation = Effect.gen(function* () {
  const replaceAt1WithX = A.replace(1, "X");
  const fromSet = replaceAt1WithX(new Set(["a", "b", "c"]));
  const tooShort = replaceAt1WithX(["solo"]);

  yield* Console.log(`A.replace(1, "X")(Set("a", "b", "c")) => ${formatUnknown(fromSet)}`);
  yield* Console.log(`A.replace(1, "X")(["solo"]) => ${formatUnknown(tooShort)}`);
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
      description: "Replace a valid index and show the undefined contract for invalid indices.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable Invocation",
      description: "Use data-last style with iterable input and verify short-input behavior.",
      run: exampleCurriedIterableInvocation,
    },
  ],
});

BunRuntime.runMain(program);
