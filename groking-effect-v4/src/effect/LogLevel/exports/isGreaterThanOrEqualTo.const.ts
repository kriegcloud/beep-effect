/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: isGreaterThanOrEqualTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:50:37.433Z
 *
 * Overview:
 * Determines if the first log level is more severe than or equal to the second.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Logger, LogLevel } from "effect"
 *
 * // Check if level meets minimum threshold
 * console.log(LogLevel.isGreaterThanOrEqualTo("Error", "Error")) // true
 * console.log(LogLevel.isGreaterThanOrEqualTo("Error", "Info")) // true
 * console.log(LogLevel.isGreaterThanOrEqualTo("Debug", "Info")) // false
 *
 * // Create a logger that only logs Info and above
 * const infoLogger = Logger.make((options) => {
 *   if (LogLevel.isGreaterThanOrEqualTo(options.logLevel, "Info")) {
 *     console.log(`[${options.logLevel}] ${options.message}`)
 *   }
 * })
 *
 * // Production logger - only Error and Fatal
 * const productionLogger = Logger.make((options) => {
 *   if (LogLevel.isGreaterThanOrEqualTo(options.logLevel, "Error")) {
 *     console.error(
 *       `${options.date.toISOString()} [${options.logLevel}] ${options.message}`
 *     )
 *   }
 * })
 *
 * // Curried usage for filtering
 * const isInfoOrAbove = LogLevel.isGreaterThanOrEqualTo("Info")
 * const shouldLog = isInfoOrAbove("Error") // true
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
const exportName = "isGreaterThanOrEqualTo";
const exportKind = "const";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "Determines if the first log level is more severe than or equal to the second.";
const sourceExample =
  'import { Logger, LogLevel } from "effect"\n\n// Check if level meets minimum threshold\nconsole.log(LogLevel.isGreaterThanOrEqualTo("Error", "Error")) // true\nconsole.log(LogLevel.isGreaterThanOrEqualTo("Error", "Info")) // true\nconsole.log(LogLevel.isGreaterThanOrEqualTo("Debug", "Info")) // false\n\n// Create a logger that only logs Info and above\nconst infoLogger = Logger.make((options) => {\n  if (LogLevel.isGreaterThanOrEqualTo(options.logLevel, "Info")) {\n    console.log(`[${options.logLevel}] ${options.message}`)\n  }\n})\n\n// Production logger - only Error and Fatal\nconst productionLogger = Logger.make((options) => {\n  if (LogLevel.isGreaterThanOrEqualTo(options.logLevel, "Error")) {\n    console.error(\n      `${options.date.toISOString()} [${options.logLevel}] ${options.message}`\n    )\n  }\n})\n\n// Curried usage for filtering\nconst isInfoOrAbove = LogLevel.isGreaterThanOrEqualTo("Info")\nconst shouldLog = isInfoOrAbove("Error") // true';
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
