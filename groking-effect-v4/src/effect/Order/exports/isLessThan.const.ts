/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: isLessThan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.470Z
 *
 * Overview:
 * Tests whether one value is strictly less than another according to the given order.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 *
 * const isLessThanNumber = Order.isLessThan(Order.Number)
 *
 * console.log(isLessThanNumber(1, 2)) // true
 * console.log(isLessThanNumber(2, 1)) // false
 * console.log(isLessThanNumber(1, 1)) // false
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
const exportName = "isLessThan";
const exportKind = "const";
const moduleImportPath = "effect/Order";
const sourceSummary = "Tests whether one value is strictly less than another according to the given order.";
const sourceExample =
  'import { Order } from "effect"\n\nconst isLessThanNumber = Order.isLessThan(Order.Number)\n\nconsole.log(isLessThanNumber(1, 2)) // true\nconsole.log(isLessThanNumber(2, 1)) // false\nconsole.log(isLessThanNumber(1, 1)) // false';
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
