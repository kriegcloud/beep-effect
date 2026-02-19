/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: isLessThan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:50:37.433Z
 *
 * Overview:
 * Determines if the first log level is less severe than the second.
 *
 * Source JSDoc Example:
 * ```ts
 * import { LogLevel } from "effect"
 *
 * // Check if Debug is less severe than Info
 * console.log(LogLevel.isLessThan("Debug", "Info")) // true
 * console.log(LogLevel.isLessThan("Error", "Info")) // false
 *
 * // Filter out verbose logs
 * const isFatalVerbose = LogLevel.isLessThan("Fatal", "Info")
 * const isErrorVerbose = LogLevel.isLessThan("Error", "Info")
 * const isTraceVerbose = LogLevel.isLessThan("Trace", "Info")
 * console.log(isFatalVerbose) // false (Fatal is not verbose)
 * console.log(isErrorVerbose) // false (Error is not verbose)
 * console.log(isTraceVerbose) // true (Trace is verbose)
 *
 * // Curried usage
 * const isLessSevereThanError = LogLevel.isLessThan("Error")
 * console.log(isLessSevereThanError("Info")) // true
 * console.log(isLessSevereThanError("Fatal")) // false
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
import * as LogLevelModule from "effect/LogLevel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isLessThan";
const exportKind = "const";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "Determines if the first log level is less severe than the second.";
const sourceExample =
  'import { LogLevel } from "effect"\n\n// Check if Debug is less severe than Info\nconsole.log(LogLevel.isLessThan("Debug", "Info")) // true\nconsole.log(LogLevel.isLessThan("Error", "Info")) // false\n\n// Filter out verbose logs\nconst isFatalVerbose = LogLevel.isLessThan("Fatal", "Info")\nconst isErrorVerbose = LogLevel.isLessThan("Error", "Info")\nconst isTraceVerbose = LogLevel.isLessThan("Trace", "Info")\nconsole.log(isFatalVerbose) // false (Fatal is not verbose)\nconsole.log(isErrorVerbose) // false (Error is not verbose)\nconsole.log(isTraceVerbose) // true (Trace is verbose)\n\n// Curried usage\nconst isLessSevereThanError = LogLevel.isLessThan("Error")\nconsole.log(isLessSevereThanError("Info")) // true\nconsole.log(isLessSevereThanError("Fatal")) // false';
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
