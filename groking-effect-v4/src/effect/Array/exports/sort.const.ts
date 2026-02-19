/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: sort
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Sorts an array by the given `Order`, returning a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.sort([3, 1, 4, 1, 5], Order.Number)) // [1, 1, 3, 4, 5]
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
import * as Order from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "sort";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Sorts an array by the given `Order`, returning a new array.";
const sourceExample =
  'import { Array, Order } from "effect"\n\nconsole.log(Array.sort([3, 1, 4, 1, 5], Order.Number)) // [1, 1, 3, 4, 5]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect sort as a runtime value before running sort scenarios.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [3, 1, 4, 1, 5];
  const sorted = A.sort(input, Order.Number);

  yield* Console.log(`input: ${formatUnknown(input)}`);
  yield* Console.log(`A.sort(input, Order.Number): ${formatUnknown(sorted)}`);
});

const exampleCurriedInvocation = Effect.gen(function* () {
  const sortNumbers = A.sort(Order.Number);
  const values = [10, -2, 10, 7];
  const sorted = sortNumbers(values);

  yield* Console.log(`values: ${formatUnknown(values)}`);
  yield* Console.log(`A.sort(Order.Number)(values): ${formatUnknown(sorted)}`);
});

const exampleNonMutatingBehavior = Effect.gen(function* () {
  const original = [9, 2, 6];
  const sorted = A.sort(original, Order.Number);
  sorted[0] = 99;

  yield* Console.log(`original after sort: ${formatUnknown(original)}`);
  yield* Console.log(`mutated sorted copy: ${formatUnknown(sorted)}`);
  yield* Console.log("sort returns a new array and leaves the input unchanged.");
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
      description: "Sort number input with Order.Number using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Invocation",
      description: "Use the curried API form by providing the Order first.",
      run: exampleCurriedInvocation,
    },
    {
      title: "Non-Mutating Behavior",
      description: "Show that mutating the sorted result does not change the original input.",
      run: exampleNonMutatingBehavior,
    },
  ],
});

BunRuntime.runMain(program);
