/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: isLessThanOrEqualTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:14:14.517Z
 *
 * Overview:
 * Determines if the first log level is less severe than or equal to the second.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Logger, LogLevel } from "effect"
 * 
 * // Check if level is at or below threshold
 * console.log(LogLevel.isLessThanOrEqualTo("Info", "Info")) // true
 * console.log(LogLevel.isLessThanOrEqualTo("Debug", "Info")) // true
 * console.log(LogLevel.isLessThanOrEqualTo("Error", "Info")) // false
 * 
 * // Create a logger that suppresses verbose logs
 * const quietLogger = Logger.make((options) => {
 *   if (LogLevel.isLessThanOrEqualTo(options.logLevel, "Info")) {
 *     console.log(`[${options.logLevel}] ${options.message}`)
 *   }
 * })
 * 
 * // Development logger - suppress trace logs
 * const devLogger = Logger.make((options) => {
 *   if (LogLevel.isLessThanOrEqualTo(options.logLevel, "Debug")) {
 *     console.log(`[${options.logLevel}] ${options.message}`)
 *   }
 * })
 * 
 * // Curried usage for filtering
 * const isInfoOrBelow = LogLevel.isLessThanOrEqualTo("Info")
 * const shouldLog = isInfoOrBelow("Debug") // true
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
import * as LogLevelModule from "effect/LogLevel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isLessThanOrEqualTo";
const exportKind = "const";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "Determines if the first log level is less severe than or equal to the second.";
const sourceExample = "import { Logger, LogLevel } from \"effect\"\n\n// Check if level is at or below threshold\nconsole.log(LogLevel.isLessThanOrEqualTo(\"Info\", \"Info\")) // true\nconsole.log(LogLevel.isLessThanOrEqualTo(\"Debug\", \"Info\")) // true\nconsole.log(LogLevel.isLessThanOrEqualTo(\"Error\", \"Info\")) // false\n\n// Create a logger that suppresses verbose logs\nconst quietLogger = Logger.make((options) => {\n  if (LogLevel.isLessThanOrEqualTo(options.logLevel, \"Info\")) {\n    console.log(`[${options.logLevel}] ${options.message}`)\n  }\n})\n\n// Development logger - suppress trace logs\nconst devLogger = Logger.make((options) => {\n  if (LogLevel.isLessThanOrEqualTo(options.logLevel, \"Debug\")) {\n    console.log(`[${options.logLevel}] ${options.message}`)\n  }\n})\n\n// Curried usage for filtering\nconst isInfoOrBelow = LogLevel.isLessThanOrEqualTo(\"Info\")\nconst shouldLog = isInfoOrBelow(\"Debug\") // true";
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
