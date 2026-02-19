/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: make
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.470Z
 *
 * Overview:
 * Creates a new `Order` instance from a comparison function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const byAge = Order.make<{ name: string; age: number }>((self, that) => {
 *   if (self.age < that.age) return -1
 *   if (self.age > that.age) return 1
 *   return 0
 * })
 *
 * console.log(byAge({ name: "Alice", age: 30 }, { name: "Bob", age: 25 })) // 1
 * console.log(byAge({ name: "Alice", age: 25 }, { name: "Bob", age: 30 })) // -1
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
const exportName = "make";
const exportKind = "function";
const moduleImportPath = "effect/Order";
const sourceSummary = "Creates a new `Order` instance from a comparison function.";
const sourceExample =
  'import { Order } from "effect"\n\nconst byAge = Order.make<{ name: string; age: number }>((self, that) => {\n  if (self.age < that.age) return -1\n  if (self.age > that.age) return 1\n  return 0\n})\n\nconsole.log(byAge({ name: "Alice", age: 30 }, { name: "Bob", age: 25 })) // 1\nconsole.log(byAge({ name: "Alice", age: 25 }, { name: "Bob", age: 30 })) // -1';
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
