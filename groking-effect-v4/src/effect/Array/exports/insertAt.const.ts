/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: insertAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Inserts an element at the specified index, returning a new `NonEmptyArray`, or `undefined` if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.insertAt(["a", "b", "c", "e"], 3, "d")) // ["a", "b", "c", "d", "e"]
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
const exportName = "insertAt";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Inserts an element at the specified index, returning a new `NonEmptyArray`, or `undefined` if the index is out of bounds.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.insertAt(["a", "b", "c", "e"], 3, "d")) // ["a", "b", "c", "d", "e"]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = ["a", "b", "c", "e"];
  const inserted = A.insertAt(input, 3, "d");

  yield* Console.log(`insertAt(["a", "b", "c", "e"], 3, "d") => ${JSON.stringify(inserted)}`);
  yield* Console.log(`original input remains ${JSON.stringify(input)}`);
});

const exampleCurriedAndBoundsInvocation = Effect.gen(function* () {
  const insertMarkerAt2 = A.insertAt(2, "!");
  const fromSet = insertMarkerAt2(new Set(["x", "y", "z"]));
  const outOfBounds = A.insertAt(["x", "y"], 5, "!");
  const negativeIndex = A.insertAt(["x", "y"], -1, "!");

  yield* Console.log(`insertAt(2, "!")(Set("x", "y", "z")) => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`insertAt(["x", "y"], 5, "!") => ${JSON.stringify(outOfBounds)}`);
  yield* Console.log(`insertAt(["x", "y"], -1, "!") => ${JSON.stringify(negativeIndex)}`);
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
      description: "Insert into the middle of an array using the documented three-argument call form.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable + Bounds",
      description: "Use data-last style with an iterable and show that invalid indices return undefined.",
      run: exampleCurriedAndBoundsInvocation,
    },
  ],
});

BunRuntime.runMain(program);
