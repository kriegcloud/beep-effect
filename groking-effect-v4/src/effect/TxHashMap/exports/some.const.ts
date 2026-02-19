/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.962Z
 *
 * Overview:
 * Checks if at least one entry in the TxHashMap satisfies the given predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a product inventory
 *   const inventory = yield* TxHashMap.make(
 *     ["laptop", { price: 999, stock: 5 }],
 *     ["mouse", { price: 29, stock: 50 }],
 *     ["keyboard", { price: 79, stock: 0 }]
 *   )
 * 
 *   // Check if any products are expensive
 *   const hasExpensiveProducts = yield* TxHashMap.some(
 *     inventory,
 *     (product) => product.price > 500
 *   )
 *   console.log(hasExpensiveProducts) // true
 * 
 *   // Check if any products are out of stock
 *   const hasOutOfStock = yield* TxHashMap.some(
 *     inventory,
 *     (product) => product.stock === 0
 *   )
 *   console.log(hasOutOfStock) // true
 * 
 *   // Data-last usage with pipe
 *   const hasAffordableItems = yield* inventory.pipe(
 *     TxHashMap.some((product) => product.price < 50)
 *   )
 *   console.log(hasAffordableItems) // true (mouse is $29)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxHashMapModule from "effect/TxHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if at least one entry in the TxHashMap satisfies the given predicate.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a product inventory\n  const inventory = yield* TxHashMap.make(\n    [\"laptop\", { price: 999, stock: 5 }],\n    [\"mouse\", { price: 29, stock: 50 }],\n    [\"keyboard\", { price: 79, stock: 0 }]\n  )\n\n  // Check if any products are expensive\n  const hasExpensiveProducts = yield* TxHashMap.some(\n    inventory,\n    (product) => product.price > 500\n  )\n  console.log(hasExpensiveProducts) // true\n\n  // Check if any products are out of stock\n  const hasOutOfStock = yield* TxHashMap.some(\n    inventory,\n    (product) => product.stock === 0\n  )\n  console.log(hasOutOfStock) // true\n\n  // Data-last usage with pipe\n  const hasAffordableItems = yield* inventory.pipe(\n    TxHashMap.some((product) => product.price < 50)\n  )\n  console.log(hasAffordableItems) // true (mouse is $29)\n})";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
