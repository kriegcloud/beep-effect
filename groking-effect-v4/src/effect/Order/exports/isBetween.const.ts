/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: isBetween
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:50:38.097Z
 *
 * Overview:
 * Tests whether a value is between a minimum and a maximum (inclusive) according to the given order.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const betweenNumber = Order.isBetween(Order.Number)
 *
 * console.log(betweenNumber(5, { minimum: 1, maximum: 10 })) // true
 * console.log(betweenNumber(1, { minimum: 1, maximum: 10 })) // true
 * console.log(betweenNumber(10, { minimum: 1, maximum: 10 })) // true
 * console.log(betweenNumber(0, { minimum: 1, maximum: 10 })) // false
 * console.log(betweenNumber(11, { minimum: 1, maximum: 10 })) // false
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
import * as OrderModule from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isBetween";
const exportKind = "const";
const moduleImportPath = "effect/Order";
const sourceSummary =
  "Tests whether a value is between a minimum and a maximum (inclusive) according to the given order.";
const sourceExample =
  'import { Order } from "effect"\n\nconst betweenNumber = Order.isBetween(Order.Number)\n\nconsole.log(betweenNumber(5, { minimum: 1, maximum: 10 })) // true\nconsole.log(betweenNumber(1, { minimum: 1, maximum: 10 })) // true\nconsole.log(betweenNumber(10, { minimum: 1, maximum: 10 })) // true\nconsole.log(betweenNumber(0, { minimum: 1, maximum: 10 })) // false\nconsole.log(betweenNumber(11, { minimum: 1, maximum: 10 })) // false';
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
