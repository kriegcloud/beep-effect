/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: LogLevel
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:14:14.517Z
 *
 * Overview:
 * Represents the severity level of a log message.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Using log levels with Effect logging
 * const program = Effect.gen(function*() {
 *   yield* Effect.logFatal("System failure")
 *   yield* Effect.logError("Database error")
 *   yield* Effect.logWarning("High memory usage")
 *   yield* Effect.logInfo("User logged in")
 *   yield* Effect.logDebug("Processing request")
 *   yield* Effect.logTrace("Variable state")
 * })
 *
 * // Type-safe log level variables
 * const errorLevel = "Error" // LogLevel
 * const debugLevel = "Debug" // LogLevel
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LogLevelModule from "effect/LogLevel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "LogLevel";
const exportKind = "type";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "Represents the severity level of a log message.";
const sourceExample =
  'import { Effect } from "effect"\n\n// Using log levels with Effect logging\nconst program = Effect.gen(function*() {\n  yield* Effect.logFatal("System failure")\n  yield* Effect.logError("Database error")\n  yield* Effect.logWarning("High memory usage")\n  yield* Effect.logInfo("User logged in")\n  yield* Effect.logDebug("Processing request")\n  yield* Effect.logTrace("Variable state")\n})\n\n// Type-safe log level variables\nconst errorLevel = "Error" // LogLevel\nconst debugLevel = "Debug" // LogLevel';
const moduleRecord = LogLevelModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
