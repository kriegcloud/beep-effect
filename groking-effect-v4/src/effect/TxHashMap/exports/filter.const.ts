/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.016Z
 *
 * Overview:
 * Filters the TxHashMap to keep only entries that satisfy the provided predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a product inventory
 *   const inventory = yield* TxHashMap.make(
 *     ["laptop", { price: 999, stock: 5, category: "electronics" }],
 *     ["mouse", { price: 29, stock: 50, category: "electronics" }],
 *     ["book", { price: 15, stock: 100, category: "books" }],
 *     ["phone", { price: 699, stock: 0, category: "electronics" }]
 *   )
 *
 *   // Filter to get only electronics in stock
 *   const electronicsInStock = yield* TxHashMap.filter(
 *     inventory,
 *     (product) => product.category === "electronics" && product.stock > 0
 *   )
 *
 *   const size = yield* TxHashMap.size(electronicsInStock)
 *   console.log(size) // 2 (laptop and mouse)
 *
 *   // Data-last usage with pipe
 *   const expensiveItems = yield* inventory.pipe(
 *     TxHashMap.filter((product) => product.price > 500)
 *   )
 *
 *   const expensiveSize = yield* TxHashMap.size(expensiveItems)
 *   console.log(expensiveSize) // 2 (laptop and phone)
 *
 *   // Type guard usage
 *   const highValueItems = yield* TxHashMap.filter(
 *     inventory,
 *     (product): product is typeof product & { price: number } =>
 *       product.price > 50
 *   )
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
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Filters the TxHashMap to keep only entries that satisfy the provided predicate.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a product inventory\n  const inventory = yield* TxHashMap.make(\n    ["laptop", { price: 999, stock: 5, category: "electronics" }],\n    ["mouse", { price: 29, stock: 50, category: "electronics" }],\n    ["book", { price: 15, stock: 100, category: "books" }],\n    ["phone", { price: 699, stock: 0, category: "electronics" }]\n  )\n\n  // Filter to get only electronics in stock\n  const electronicsInStock = yield* TxHashMap.filter(\n    inventory,\n    (product) => product.category === "electronics" && product.stock > 0\n  )\n\n  const size = yield* TxHashMap.size(electronicsInStock)\n  console.log(size) // 2 (laptop and mouse)\n\n  // Data-last usage with pipe\n  const expensiveItems = yield* inventory.pipe(\n    TxHashMap.filter((product) => product.price > 500)\n  )\n\n  const expensiveSize = yield* TxHashMap.size(expensiveItems)\n  console.log(expensiveSize) // 2 (laptop and phone)\n\n  // Type guard usage\n  const highValueItems = yield* TxHashMap.filter(\n    inventory,\n    (product): product is typeof product & { price: number } =>\n      product.price > 50\n  )\n})';
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
