/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: sortWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Sorts an array by a derived key using a mapping function and an `Order` for that key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.sortWith(["aaa", "b", "cc"], (s) => s.length, Order.Number))
 * // ["b", "cc", "aaa"]
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
const exportName = "sortWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Sorts an array by a derived key using a mapping function and an `Order` for that key.";
const sourceExample =
  'import { Array, Order } from "effect"\n\nconsole.log(Array.sortWith(["aaa", "b", "cc"], (s) => s.length, Order.Number))\n// ["b", "cc", "aaa"]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = ["aaa", "b", "cc"];
  const sorted = A.sortWith(input, (s) => s.length, Order.Number);

  yield* Console.log(`input: ${formatUnknown(input)}`);
  yield* Console.log(`A.sortWith(input, (s) => s.length, Order.Number): ${formatUnknown(sorted)}`);
});

const exampleCurriedInvocation = Effect.gen(function* () {
  const sortByLength = A.sortWith((word: string) => word.length, Order.Number);
  const values = ["delta", "a", "echo", "bb"];
  const sorted = sortByLength(values);

  yield* Console.log(`values: ${formatUnknown(values)}`);
  yield* Console.log(`A.sortWith((word) => word.length, Order.Number)(values): ${formatUnknown(sorted)}`);
});

const exampleNonMutatingBehavior = Effect.gen(function* () {
  const original = [
    { label: "wide", width: 4 },
    { label: "thin", width: 1 },
    { label: "medium", width: 2 },
  ];
  const sorted = A.sortWith(original, (item) => item.width, Order.Number);
  sorted[0] = { label: "edited", width: 99 };

  yield* Console.log(`original after sortWith: ${formatUnknown(original)}`);
  yield* Console.log(`mutated sorted copy: ${formatUnknown(sorted)}`);
  yield* Console.log("sortWith returns a new array and leaves the input unchanged.");
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
      description: "Sort strings by length using the documented three-argument call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Invocation",
      description: "Provide mapping function and order first, then apply to an input array.",
      run: exampleCurriedInvocation,
    },
    {
      title: "Non-Mutating Behavior",
      description: "Show that changing the sorted output does not mutate the original input.",
      run: exampleNonMutatingBehavior,
    },
  ],
});

BunRuntime.runMain(program);
