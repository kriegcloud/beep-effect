/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Removes the element at the specified index, returning a new array. If the index is out of bounds, returns a copy of the original.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.remove([1, 2, 3, 4], 2)) // [1, 2, 4]
 * console.log(Array.remove([1, 2, 3, 4], 5)) // [1, 2, 3, 4]
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
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Removes the element at the specified index, returning a new array. If the index is out of bounds, returns a copy of the original.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.remove([1, 2, 3, 4], 2)) // [1, 2, 4]\nconsole.log(Array.remove([1, 2, 3, 4], 5)) // [1, 2, 3, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the remove export runtime shape before invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4];
  const removed = A.remove(input, 2);
  const outOfBounds = A.remove(input, 5);

  yield* Console.log(`A.remove([1, 2, 3, 4], 2) => ${formatUnknown(removed)}`);
  yield* Console.log(`A.remove([1, 2, 3, 4], 5) => ${formatUnknown(outOfBounds)}`);
  yield* Console.log(`Out-of-bounds returns copy (same reference: ${outOfBounds === input})`);
  yield* Console.log(`Original input remains => ${formatUnknown(input)}`);
});

const exampleCurriedInvocation = Effect.gen(function* () {
  const removeAt1 = A.remove(1);
  const fromSet = removeAt1(new Set(["alpha", "beta", "gamma"]));
  const removeHead = A.remove(0);
  const fromArray = removeHead(["first", "second", "third"]);

  yield* Console.log(`A.remove(1)(Set("alpha", "beta", "gamma")) => ${formatUnknown(fromSet)}`);
  yield* Console.log(`A.remove(0)(["first", "second", "third"]) => ${formatUnknown(fromArray)}`);
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
      description: "Remove an in-range index and show the out-of-bounds copy behavior.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable Invocation",
      description: "Use data-last form with iterable input and remove the head with a partial application.",
      run: exampleCurriedInvocation,
    },
  ],
});

BunRuntime.runMain(program);
