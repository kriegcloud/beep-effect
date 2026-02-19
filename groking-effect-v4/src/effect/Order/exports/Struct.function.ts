/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: Struct
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:50:38.098Z
 *
 * Overview:
 * Creates an `Order` for structs by applying the given `Order`s to each property in sequence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const personOrder = Order.Struct({
 *   name: Order.String,
 *   age: Order.Number
 * })
 *
 * const person1 = { name: "Alice", age: 30 }
 * const person2 = { name: "Bob", age: 25 }
 * const person3 = { name: "Alice", age: 25 }
 *
 * console.log(personOrder(person1, person2)) // -1 (Alice < Bob)
 * console.log(personOrder(person1, person3)) // 1 (same name, 30 > 25)
 * console.log(personOrder(person1, person1)) // 0
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
const exportName = "Struct";
const exportKind = "function";
const moduleImportPath = "effect/Order";
const sourceSummary = "Creates an `Order` for structs by applying the given `Order`s to each property in sequence.";
const sourceExample =
  'import { Order } from "effect"\n\nconst personOrder = Order.Struct({\n  name: Order.String,\n  age: Order.Number\n})\n\nconst person1 = { name: "Alice", age: 30 }\nconst person2 = { name: "Bob", age: 25 }\nconst person3 = { name: "Alice", age: 25 }\n\nconsole.log(personOrder(person1, person2)) // -1 (Alice < Bob)\nconsole.log(personOrder(person1, person3)) // 1 (same name, 30 > 25)\nconsole.log(personOrder(person1, person1)) // 0';
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
