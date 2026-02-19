/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: Date
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.469Z
 *
 * Overview:
 * An `Order` instance for `Date` objects that compares them chronologically by their timestamp.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 * 
 * const date1 = new Date("2023-01-01")
 * const date2 = new Date("2023-01-02")
 * 
 * console.log(Order.Date(date1, date2)) // -1
 * console.log(Order.Date(date2, date1)) // 1
 * console.log(Order.Date(date1, date1)) // 0
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
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
const exportName = "Date";
const exportKind = "const";
const moduleImportPath = "effect/Order";
const sourceSummary = "An `Order` instance for `Date` objects that compares them chronologically by their timestamp.";
const sourceExample = "import { Order } from \"effect\"\n\nconst date1 = new Date(\"2023-01-01\")\nconst date2 = new Date(\"2023-01-02\")\n\nconsole.log(Order.Date(date1, date2)) // -1\nconsole.log(Order.Date(date2, date1)) // 1\nconsole.log(Order.Date(date1, date1)) // 0";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
