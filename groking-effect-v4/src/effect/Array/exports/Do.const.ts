/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Starting point for the "do simulation" — an array comprehension pattern.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 3, 5]),
 *   Array.bind("y", () => [2, 4, 6]),
 *   Array.filter(({ x, y }) => x < y),
 *   Array.map(({ x, y }) => [x, y] as const)
 * )
 * console.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]
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
const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = 'Starting point for the "do simulation" — an array comprehension pattern.';
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind("x", () => [1, 3, 5]),\n  Array.bind("y", () => [2, 4, 6]),\n  Array.filter(({ x, y }) => x < y),\n  Array.map(({ x, y }) => [x, y] as const)\n)\nconsole.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSeedScope = Effect.gen(function* () {
  yield* Console.log("Array.Do seeds a do-notation scope with one empty record.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`Seed scope count: ${A.Do.length}`);
});

const exampleSourceAlignedComprehension = Effect.gen(function* () {
  const withX = A.bind(A.Do, "x", () => [1, 3, 5]);
  const withXAndY = A.bind(withX, "y", () => [2, 4, 6]);
  const filtered = A.filter(withXAndY, ({ x, y }) => x < y);
  const result = A.map(filtered, ({ x, y }) => [x, y] as const);

  yield* Console.log(`Pairs where x < y: ${JSON.stringify(result)}`);
});

const exampleDependentBindings = Effect.gen(function* () {
  const withSku = A.bind(A.Do, "sku", () => ["beep", "boop"]);
  const withQuantities = A.bind(withSku, "qty", () => [1, 2, 3]);
  const withUnitPrice = A.bind(withQuantities, "unitPrice", ({ sku }) => (sku === "beep" ? [10] : [15]));
  const withTotal = A.let(withUnitPrice, "total", ({ qty, unitPrice }) => qty * unitPrice);
  const highValueOrders = A.filter(withTotal, ({ total }) => total >= 20);

  yield* Console.log(`Orders with total >= 20: ${JSON.stringify(highValueOrders)}`);
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
      title: "Seed Scope Value",
      description: "Inspect the seed record used to start array do-notation chains.",
      run: exampleSeedScope,
    },
    {
      title: "Source-Aligned Pair Comprehension",
      description: "Reproduce the documented bind/filter/map pipeline starting from Array.Do.",
      run: exampleSourceAlignedComprehension,
    },
    {
      title: "Dependent Binding With Derived Fields",
      description: "Use prior bindings to derive prices and totals, then keep high-value combinations.",
      run: exampleDependentBindings,
    },
  ],
});

BunRuntime.runMain(program);
