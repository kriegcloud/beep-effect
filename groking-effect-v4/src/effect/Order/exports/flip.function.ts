/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: flip
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.469Z
 *
 * Overview:
 * Creates a new `Order` that reverses the comparison order of the input `Order`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const flip = Order.flip(Order.Number)
 *
 * console.log(flip(1, 2)) // 1
 * console.log(flip(2, 1)) // -1
 * console.log(flip(1, 1)) // 0
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OrderModule from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flip";
const exportKind = "function";
const moduleImportPath = "effect/Order";
const sourceSummary = "Creates a new `Order` that reverses the comparison order of the input `Order`.";
const sourceExample =
  'import { Order } from "effect"\n\nconst flip = Order.flip(Order.Number)\n\nconsole.log(flip(1, 2)) // 1\nconsole.log(flip(2, 1)) // -1\nconsole.log(flip(1, 1)) // 0';
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
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
