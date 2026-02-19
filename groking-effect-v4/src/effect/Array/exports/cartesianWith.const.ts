/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: cartesianWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Computes the cartesian product of two arrays, applying a combiner to each pair.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.cartesianWith([1, 2], ["a", "b"], (a, b) => `${a}-${b}`)
 * console.log(result) // ["1-a", "1-b", "2-a", "2-b"]
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
const exportName = "cartesianWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes the cartesian product of two arrays, applying a combiner to each pair.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.cartesianWith([1, 2], ["a", "b"], (a, b) => `${a}-${b}`)\nconsole.log(result) // ["1-a", "1-b", "2-a", "2-b"]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the cartesianWith export runtime shape before using it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCartesianWithFromDocs = Effect.gen(function* () {
  const numbers = [1, 2] as const;
  const letters = ["a", "b"] as const;
  const combined = A.cartesianWith(numbers, letters, (a, b) => `${a}-${b}`);

  yield* Console.log(`A.cartesianWith([1, 2], ["a", "b"], combine) => ${formatUnknown(combined)}`);
  yield* Console.log(`Combination count: ${combined.length} (${numbers.length} * ${letters.length})`);
});

const exampleCurriedAndEmptyInputs = Effect.gen(function* () {
  const curried = A.cartesianWith(
    ["small", "large"],
    (quantity: number, size: string) => `${quantity}x${size}`
  )([1, 2]);
  const emptyLeft = A.cartesianWith([] as ReadonlyArray<number>, ["x"], (a, b) => `${a}${b}`);
  const emptyRight = A.cartesianWith([1, 2], [] as ReadonlyArray<string>, (a, b) => `${a}${b}`);

  yield* Console.log(`Curried form A.cartesianWith(["small", "large"], combine)([1, 2]) => ${formatUnknown(curried)}`);
  yield* Console.log(`Empty left input => ${formatUnknown(emptyLeft)}`);
  yield* Console.log(`Empty right input => ${formatUnknown(emptyRight)}`);
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
      title: "Source-Aligned Cartesian Mapping",
      description: "Run the documented invocation and show mapped cartesian output.",
      run: exampleCartesianWithFromDocs,
    },
    {
      title: "Curried Call + Empty Inputs",
      description: "Demonstrate dual invocation style and empty-input behavior.",
      run: exampleCurriedAndEmptyInputs,
    },
  ],
});

BunRuntime.runMain(program);
