/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: isGreaterThan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:14:14.517Z
 *
 * Overview:
 * Determines if the first log level is more severe than the second.
 *
 * Source JSDoc Example:
 * ```ts
 * import { LogLevel } from "effect"
 *
 * // Check if Error is more severe than Info
 * console.log(LogLevel.isGreaterThan("Error", "Info")) // true
 * console.log(LogLevel.isGreaterThan("Debug", "Error")) // false
 *
 * // Use with filtering
 * const isFatal = LogLevel.isGreaterThan("Fatal", "Warn")
 * const isError = LogLevel.isGreaterThan("Error", "Warn")
 * const isDebug = LogLevel.isGreaterThan("Debug", "Warn")
 * console.log(isFatal) // true
 * console.log(isError) // true
 * console.log(isDebug) // false
 *
 * // Curried usage
 * const isMoreSevereThanInfo = LogLevel.isGreaterThan("Info")
 * console.log(isMoreSevereThanInfo("Error")) // true
 * console.log(isMoreSevereThanInfo("Debug")) // false
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
const exportName = "isGreaterThan";
const exportKind = "const";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "Determines if the first log level is more severe than the second.";
const sourceExample =
  'import { LogLevel } from "effect"\n\n// Check if Error is more severe than Info\nconsole.log(LogLevel.isGreaterThan("Error", "Info")) // true\nconsole.log(LogLevel.isGreaterThan("Debug", "Error")) // false\n\n// Use with filtering\nconst isFatal = LogLevel.isGreaterThan("Fatal", "Warn")\nconst isError = LogLevel.isGreaterThan("Error", "Warn")\nconst isDebug = LogLevel.isGreaterThan("Debug", "Warn")\nconsole.log(isFatal) // true\nconsole.log(isError) // true\nconsole.log(isDebug) // false\n\n// Curried usage\nconst isMoreSevereThanInfo = LogLevel.isGreaterThan("Info")\nconsole.log(isMoreSevereThanInfo("Error")) // true\nconsole.log(isMoreSevereThanInfo("Debug")) // false';
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
