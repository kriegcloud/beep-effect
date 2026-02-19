/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: Tuple
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.470Z
 *
 * Overview:
 * Creates an `Order` for a tuple type based on orders for each element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 * 
 * const tupleOrder = Order.Tuple([Order.Number, Order.String])
 * 
 * console.log(tupleOrder([1, "a"], [2, "b"])) // -1
 * console.log(tupleOrder([1, "b"], [1, "a"])) // 1
 * console.log(tupleOrder([1, "a"], [1, "a"])) // 0
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
const exportName = "Tuple";
const exportKind = "function";
const moduleImportPath = "effect/Order";
const sourceSummary = "Creates an `Order` for a tuple type based on orders for each element.";
const sourceExample = "import { Order } from \"effect\"\n\nconst tupleOrder = Order.Tuple([Order.Number, Order.String])\n\nconsole.log(tupleOrder([1, \"a\"], [2, \"b\"])) // -1\nconsole.log(tupleOrder([1, \"b\"], [1, \"a\"])) // 1\nconsole.log(tupleOrder([1, \"a\"], [1, \"a\"])) // 0";
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
