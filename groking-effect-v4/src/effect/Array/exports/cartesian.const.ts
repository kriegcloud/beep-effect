/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: cartesian
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Computes the cartesian product of two arrays, returning all pairs as tuples.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.cartesian([1, 2], ["a", "b"])
 * console.log(result) // [[1, "a"], [1, "b"], [2, "a"], [2, "b"]]
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
const exportName = "cartesian";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes the cartesian product of two arrays, returning all pairs as tuples.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.cartesian([1, 2], ["a", "b"])\nconsole.log(result) // [[1, "a"], [1, "b"], [2, "a"], [2, "b"]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the cartesian export runtime shape before using it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCartesianFromDocs = Effect.gen(function* () {
  const numbers = [1, 2] as const;
  const letters = ["a", "b"] as const;
  const pairs = A.cartesian(numbers, letters);

  yield* Console.log(`A.cartesian([1, 2], ["a", "b"]) => ${formatUnknown(pairs)}`);
  yield* Console.log(`Pair count: ${pairs.length} (2 * 2 = ${numbers.length * letters.length})`);
});

const exampleCurriedAndEmptyInputs = Effect.gen(function* () {
  const curriedPairs = A.cartesian(["x", "y"])([10, 20]);
  const emptyLeft = A.cartesian([] as ReadonlyArray<number>, ["z"]);
  const emptyRight = A.cartesian([1, 2], [] as ReadonlyArray<string>);

  yield* Console.log(`Curried form A.cartesian(["x", "y"])([10, 20]) => ${formatUnknown(curriedPairs)}`);
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
      title: "Source-Aligned Cartesian Pairs",
      description: "Run the documented two-argument invocation and confirm pair count.",
      run: exampleCartesianFromDocs,
    },
    {
      title: "Curried Call + Empty Inputs",
      description: "Demonstrate dual invocation style and empty-input behavior.",
      run: exampleCurriedAndEmptyInputs,
    },
  ],
});

BunRuntime.runMain(program);
