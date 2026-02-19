/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: combineAll
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:50:38.097Z
 *
 * Overview:
 * Combines all `Order` instances in the provided collection into a single `Order`. The resulting `Order` compares using each `Order` in sequence until a non-zero result is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const byAge = Order.mapInput(
 *   Order.Number,
 *   (person: { name: string; age: number }) => person.age
 * )
 * const byName = Order.mapInput(
 *   Order.String,
 *   (person: { name: string; age: number }) => person.name
 * )
 *
 * const combinedOrder = Order.combineAll([byAge, byName])
 *
 * const person1 = { name: "Alice", age: 30 }
 * const person2 = { name: "Bob", age: 30 }
 *
 * console.log(combinedOrder(person1, person2)) // -1 (Same age, Alice < Bob)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OrderModule from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "combineAll";
const exportKind = "function";
const moduleImportPath = "effect/Order";
const sourceSummary =
  "Combines all `Order` instances in the provided collection into a single `Order`. The resulting `Order` compares using each `Order` in sequence until a non-zero result is found.";
const sourceExample =
  'import { Order } from "effect"\n\nconst byAge = Order.mapInput(\n  Order.Number,\n  (person: { name: string; age: number }) => person.age\n)\nconst byName = Order.mapInput(\n  Order.String,\n  (person: { name: string; age: number }) => person.name\n)\n\nconst combinedOrder = Order.combineAll([byAge, byName])\n\nconst person1 = { name: "Alice", age: 30 }\nconst person2 = { name: "Bob", age: 30 }\n\nconsole.log(combinedOrder(person1, person2)) // -1 (Same age, Alice < Bob)';
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
