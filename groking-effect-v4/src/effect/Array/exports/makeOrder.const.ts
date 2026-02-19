/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: makeOrder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Creates an `Order` for arrays based on an element `Order`. Arrays are compared element-wise; if all compared elements are equal, shorter arrays come first.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order } from "effect"
 *
 * const arrayOrder = Array.makeOrder(Order.Number)
 * console.log(arrayOrder([1, 2], [1, 3])) // -1
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
import * as Order from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeOrder";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Creates an `Order` for arrays based on an element `Order`. Arrays are compared element-wise; if all compared elements are equal, shorter arrays come first.";
const sourceExample =
  'import { Array, Order } from "effect"\n\nconst arrayOrder = Array.makeOrder(Order.Number)\nconsole.log(arrayOrder([1, 2], [1, 3])) // -1';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedOrdering = Effect.gen(function* () {
  const arrayOrder = A.makeOrder(Order.Number);

  yield* Console.log(`[1, 2] vs [1, 3] -> ${arrayOrder([1, 2], [1, 3])}`);
  yield* Console.log(`[1, 3] vs [1, 2] -> ${arrayOrder([1, 3], [1, 2])}`);
  yield* Console.log(`[1, 2] vs [1, 2] -> ${arrayOrder([1, 2], [1, 2])}`);
});

const exampleLengthTieBreak = Effect.gen(function* () {
  const arrayOrder = A.makeOrder(Order.Number);
  const values = [[1, 2], [1, 2, 0], [1], [0, 9]];
  const sorted = [...values].sort(arrayOrder);

  yield* Console.log(`[1, 2] vs [1, 2, 0] -> ${arrayOrder([1, 2], [1, 2, 0])}`);
  yield* Console.log(`sorted -> ${JSON.stringify(sorted)}`);
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
      title: "Source-Aligned Ordering",
      description: "Build an array order from number ordering and compare element-by-element.",
      run: exampleSourceAlignedOrdering,
    },
    {
      title: "Length Tie-Break",
      description: "Show shorter arrays sort first when shared prefixes are equal.",
      run: exampleLengthTieBreak,
    },
  ],
});

BunRuntime.runMain(program);
