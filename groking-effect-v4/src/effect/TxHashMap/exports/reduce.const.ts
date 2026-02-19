/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.962Z
 *
 * Overview:
 * Reduces the TxHashMap entries to a single value by applying a reducer function. Iterates over all key-value pairs and accumulates them into a final result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a sales data map
 *   const sales = yield* TxHashMap.make(
 *     ["Q1", 15000],
 *     ["Q2", 18000],
 *     ["Q3", 22000],
 *     ["Q4", 25000]
 *   )
 *
 *   // Calculate total sales
 *   const totalSales = yield* TxHashMap.reduce(
 *     sales,
 *     0,
 *     (total, amount, quarter) => {
 *       console.log(`Adding ${quarter}: ${amount}`)
 *       return total + amount
 *     }
 *   )
 *   console.log(`Total sales: ${totalSales}`) // 80000
 *
 *   // Data-last usage with pipe
 *   const quarterlyReport = yield* sales.pipe(
 *     TxHashMap.reduce(
 *       { quarters: 0, total: 0, max: 0 },
 *       (report, amount, quarter) => ({
 *         quarters: report.quarters + 1,
 *         total: report.total + amount,
 *         max: Math.max(report.max, amount)
 *       })
 *     )
 *   )
 *   console.log(quarterlyReport) // { quarters: 4, total: 80000, max: 25000 }
 *
 *   // Build a summary string
 *   const summary = yield* TxHashMap.reduce(
 *     sales,
 *     "",
 *     (acc, amount, quarter) => acc + `${quarter}: $${amount.toLocaleString()}\n`
 *   )
 *   console.log(summary)
 * })
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
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Reduces the TxHashMap entries to a single value by applying a reducer function. Iterates over all key-value pairs and accumulates them into a final result.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a sales data map\n  const sales = yield* TxHashMap.make(\n    ["Q1", 15000],\n    ["Q2", 18000],\n    ["Q3", 22000],\n    ["Q4", 25000]\n  )\n\n  // Calculate total sales\n  const totalSales = yield* TxHashMap.reduce(\n    sales,\n    0,\n    (total, amount, quarter) => {\n      console.log(`Adding ${quarter}: ${amount}`)\n      return total + amount\n    }\n  )\n  console.log(`Total sales: ${totalSales}`) // 80000\n\n  // Data-last usage with pipe\n  const quarterlyReport = yield* sales.pipe(\n    TxHashMap.reduce(\n      { quarters: 0, total: 0, max: 0 },\n      (report, amount, quarter) => ({\n        quarters: report.quarters + 1,\n        total: report.total + amount,\n        max: Math.max(report.max, amount)\n      })\n    )\n  )\n  console.log(quarterlyReport) // { quarters: 4, total: 80000, max: 25000 }\n\n  // Build a summary string\n  const summary = yield* TxHashMap.reduce(\n    sales,\n    "",\n    (acc, amount, quarter) => acc + `${quarter}: $${amount.toLocaleString()}\\n`\n  )\n  console.log(summary)\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
