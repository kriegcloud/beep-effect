/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: Order
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:50:38.098Z
 *
 * Overview:
 * Represents a total ordering for values of type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const byAge: Order.Order<{ name: string; age: number }> = (self, that) => {
 *   if (self.age < that.age) return -1
 *   if (self.age > that.age) return 1
 *   return 0
 * }
 *
 * const person1 = { name: "Alice", age: 30 }
 * const person2 = { name: "Bob", age: 25 }
 * console.log(byAge(person1, person2)) // 1
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OrderModule from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Order";
const exportKind = "interface";
const moduleImportPath = "effect/Order";
const sourceSummary = "Represents a total ordering for values of type `A`.";
const sourceExample =
  'import { Order } from "effect"\n\nconst byAge: Order.Order<{ name: string; age: number }> = (self, that) => {\n  if (self.age < that.age) return -1\n  if (self.age > that.age) return 1\n  return 0\n}\n\nconst person1 = { name: "Alice", age: 30 }\nconst person2 = { name: "Bob", age: 25 }\nconsole.log(byAge(person1, person2)) // 1';
const moduleRecord = OrderModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
