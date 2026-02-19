/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: toValues
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.022Z
 *
 * Overview:
 * Returns an array of all values in the TxHashMap. This is an alias for the `values` function, providing API consistency with HashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const inventory = yield* TxHashMap.make(
 *     ["laptop", { price: 999, stock: 5 }],
 *     ["mouse", { price: 29, stock: 50 }],
 *     ["keyboard", { price: 79, stock: 20 }]
 *   )
 *
 *   // Get all product information
 *   const products = yield* TxHashMap.toValues(inventory)
 *   console.log(products)
 *   // [{ price: 999, stock: 5 }, { price: 29, stock: 50 }, { price: 79, stock: 20 }]
 *
 *   // Calculate total inventory value
 *   const totalValue = products.reduce(
 *     (sum, product) => sum + (product.price * product.stock),
 *     0
 *   )
 *   console.log(`Total inventory value: $${totalValue}`) // $8,435
 *
 *   // Find products with low stock
 *   const lowStockProducts = products.filter((product) => product.stock < 10)
 *   console.log(`${lowStockProducts.length} products with low stock`)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toValues";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Returns an array of all values in the TxHashMap. This is an alias for the `values` function, providing API consistency with HashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const inventory = yield* TxHashMap.make(\n    ["laptop", { price: 999, stock: 5 }],\n    ["mouse", { price: 29, stock: 50 }],\n    ["keyboard", { price: 79, stock: 20 }]\n  )\n\n  // Get all product information\n  const products = yield* TxHashMap.toValues(inventory)\n  console.log(products)\n  // [{ price: 999, stock: 5 }, { price: 29, stock: 50 }, { price: 79, stock: 20 }]\n\n  // Calculate total inventory value\n  const totalValue = products.reduce(\n    (sum, product) => sum + (product.price * product.stock),\n    0\n  )\n  console.log(`Total inventory value: $${totalValue}`) // $8,435\n\n  // Find products with low stock\n  const lowStockProducts = products.filter((product) => product.stock < 10)\n  console.log(`${lowStockProducts.length} products with low stock`)\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
