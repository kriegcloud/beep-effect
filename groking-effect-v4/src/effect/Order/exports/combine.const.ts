/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: combine
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.469Z
 *
 * Overview:
 * Combines two `Order` instances to create a new `Order` that first compares using the first `Order`, and if the values are equal, then compares using the second `Order`.
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
 * const byAgeAndName = Order.combine(byAge, byName)
 *
 * const person1 = { name: "Alice", age: 30 }
 * const person2 = { name: "Bob", age: 30 }
 * const person3 = { name: "Charlie", age: 25 }
 *
 * console.log(byAgeAndName(person1, person2)) // -1 (Same age, Alice < Bob)
 * console.log(byAgeAndName(person1, person3)) // 1 (Alice (30) > Charlie (25))
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OrderModule from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "combine";
const exportKind = "const";
const moduleImportPath = "effect/Order";
const sourceSummary =
  "Combines two `Order` instances to create a new `Order` that first compares using the first `Order`, and if the values are equal, then compares using the second `Order`.";
const sourceExample =
  'import { Order } from "effect"\n\nconst byAge = Order.mapInput(\n  Order.Number,\n  (person: { name: string; age: number }) => person.age\n)\nconst byName = Order.mapInput(\n  Order.String,\n  (person: { name: string; age: number }) => person.name\n)\nconst byAgeAndName = Order.combine(byAge, byName)\n\nconst person1 = { name: "Alice", age: 30 }\nconst person2 = { name: "Bob", age: 30 }\nconst person3 = { name: "Charlie", age: 25 }\n\nconsole.log(byAgeAndName(person1, person2)) // -1 (Same age, Alice < Bob)\nconsole.log(byAgeAndName(person1, person3)) // 1 (Alice (30) > Charlie (25))';
const moduleRecord = OrderModule as Record<string, unknown>;

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
