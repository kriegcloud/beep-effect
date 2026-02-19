/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: makeReducer
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.470Z
 *
 * Overview:
 * Creates a `Reducer` for combining `Order` instances, useful for aggregating orders in collections.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 * 
 * const reducer = Order.makeReducer<number>()
 * const orders = [Order.Number, Order.flip(Order.Number)]
 * 
 * const combined = reducer.combineAll(orders)
 * console.log(combined(1, 2)) // -1 (uses first order)
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OrderModule from "effect/Order";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducer";
const exportKind = "function";
const moduleImportPath = "effect/Order";
const sourceSummary = "Creates a `Reducer` for combining `Order` instances, useful for aggregating orders in collections.";
const sourceExample = "import { Order } from \"effect\"\n\nconst reducer = Order.makeReducer<number>()\nconst orders = [Order.Number, Order.flip(Order.Number)]\n\nconst combined = reducer.combineAll(orders)\nconsole.log(combined(1, 2)) // -1 (uses first order)";
const moduleRecord = OrderModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
