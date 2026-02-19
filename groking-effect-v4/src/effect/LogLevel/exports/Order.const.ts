/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: Order
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:14:14.517Z
 *
 * Overview:
 * An `Order` instance for `LogLevel` that defines the severity ordering.
 *
 * Source JSDoc Example:
 * ```ts
 * import { LogLevel } from "effect"
 *
 * // Compare log levels using Order
 * console.log(LogLevel.Order("Error", "Info")) // 1 (Error > Info)
 * console.log(LogLevel.Order("Debug", "Error")) // -1 (Debug < Error)
 * console.log(LogLevel.Order("Info", "Info")) // 0 (Info == Info)
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
import * as LogLevelModule from "effect/LogLevel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Order";
const exportKind = "const";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "An `Order` instance for `LogLevel` that defines the severity ordering.";
const sourceExample =
  'import { LogLevel } from "effect"\n\n// Compare log levels using Order\nconsole.log(LogLevel.Order("Error", "Info")) // 1 (Error > Info)\nconsole.log(LogLevel.Order("Debug", "Error")) // -1 (Debug < Error)\nconsole.log(LogLevel.Order("Info", "Info")) // 0 (Info == Info)';
const moduleRecord = LogLevelModule as Record<string, unknown>;

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
