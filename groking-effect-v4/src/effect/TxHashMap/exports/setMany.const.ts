/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: setMany
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.020Z
 *
 * Overview:
 * Sets multiple key-value pairs in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create an empty product catalog
 *   const catalog = yield* TxHashMap.empty<
 *     string,
 *     { price: number; stock: number }
 *   >()
 *
 *   // Bulk load initial products
 *   const initialProducts: Array<
 *     readonly [string, { price: number; stock: number }]
 *   > = [
 *     ["laptop", { price: 999, stock: 5 }],
 *     ["mouse", { price: 29, stock: 50 }],
 *     ["keyboard", { price: 79, stock: 20 }],
 *     ["monitor", { price: 299, stock: 8 }]
 *   ]
 *
 *   yield* TxHashMap.setMany(catalog, initialProducts)
 *
 *   console.log(yield* TxHashMap.size(catalog)) // 4
 *
 *   // Update prices with a new batch
 *   const priceUpdates: Array<
 *     readonly [string, { price: number; stock: number }]
 *   > = [
 *     ["laptop", { price: 899, stock: 5 }], // sale price
 *     ["mouse", { price: 25, stock: 50 }], // sale price
 *     ["webcam", { price: 89, stock: 12 }] // new product
 *   ]
 *
 *   yield* TxHashMap.setMany(catalog, priceUpdates)
 *
 *   console.log(yield* TxHashMap.size(catalog)) // 5 (4 original + 1 new)
 *
 *   // Verify the updates
 *   const laptop = yield* TxHashMap.get(catalog, "laptop")
 *   console.log(laptop) // Option.some({ price: 899, stock: 5 })
 *
 *   // Can also use Map, Set of tuples, or any iterable of entries
 *   const jsMap = new Map([["tablet", { price: 399, stock: 3 }]])
 *   yield* TxHashMap.setMany(catalog, jsMap)
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
const exportName = "setMany";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Sets multiple key-value pairs in the TxHashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create an empty product catalog\n  const catalog = yield* TxHashMap.empty<\n    string,\n    { price: number; stock: number }\n  >()\n\n  // Bulk load initial products\n  const initialProducts: Array<\n    readonly [string, { price: number; stock: number }]\n  > = [\n    ["laptop", { price: 999, stock: 5 }],\n    ["mouse", { price: 29, stock: 50 }],\n    ["keyboard", { price: 79, stock: 20 }],\n    ["monitor", { price: 299, stock: 8 }]\n  ]\n\n  yield* TxHashMap.setMany(catalog, initialProducts)\n\n  console.log(yield* TxHashMap.size(catalog)) // 4\n\n  // Update prices with a new batch\n  const priceUpdates: Array<\n    readonly [string, { price: number; stock: number }]\n  > = [\n    ["laptop", { price: 899, stock: 5 }], // sale price\n    ["mouse", { price: 25, stock: 50 }], // sale price\n    ["webcam", { price: 89, stock: 12 }] // new product\n  ]\n\n  yield* TxHashMap.setMany(catalog, priceUpdates)\n\n  console.log(yield* TxHashMap.size(catalog)) // 5 (4 original + 1 new)\n\n  // Verify the updates\n  const laptop = yield* TxHashMap.get(catalog, "laptop")\n  console.log(laptop) // Option.some({ price: 899, stock: 5 })\n\n  // Can also use Map, Set of tuples, or any iterable of entries\n  const jsMap = new Map([["tablet", { price: 399, stock: 3 }]])\n  yield* TxHashMap.setMany(catalog, jsMap)\n})';
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
