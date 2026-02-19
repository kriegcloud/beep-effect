/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Folds an iterable from left to right into a single value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.reduce([1, 2, 3], 0, (acc, n) => acc + n)) // 6
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
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Folds an iterable from left to right into a single value.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.reduce([1, 2, 3], 0, (acc, n) => acc + n)) // 6';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3];
  const total = A.reduce(input, 0, (acc, n) => acc + n);
  const emptyFallback = A.reduce([] as Array<number>, 10, (acc, n) => acc + n);

  yield* Console.log(`A.reduce([1, 2, 3], 0, (acc, n) => acc + n) => ${total}`);
  yield* Console.log(`A.reduce([], 10, add) => ${emptyFallback}`);
});

const exampleCurriedReducer = Effect.gen(function* () {
  type LineItem = { readonly sku: string; readonly qty: number };
  const cart: ReadonlyArray<LineItem> = [
    { sku: "tea", qty: 2 },
    { sku: "coffee", qty: 1 },
    { sku: "tea", qty: 3 },
  ];

  const summarizeBySku = A.reduce({} as Record<string, number>, (acc, item: LineItem) => ({
    ...acc,
    [item.sku]: (acc[item.sku] ?? 0) + item.qty,
  }));

  const totals = summarizeBySku(cart);

  yield* Console.log(`A.reduce(seed, combine)(cart) => ${JSON.stringify(totals)}`);
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
      title: "Source-Aligned Sum",
      description: "Fold numbers left-to-right into a single total using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Aggregation",
      description: "Reuse a data-last reducer to accumulate cart quantities by SKU.",
      run: exampleCurriedReducer,
    },
  ],
});

BunRuntime.runMain(program);
