/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * Creates a `Layer` which will overwrite the current set of loggers with the specified array of `loggers`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Single logger layer
 * const JsonLoggerLive = Logger.layer([Logger.consoleJson])
 *
 * // Multiple loggers layer
 * const MultiLoggerLive = Logger.layer([
 *   Logger.consoleJson,
 *   Logger.consolePretty(),
 *   Logger.formatStructured
 * ])
 *
 * // Merge with existing loggers
 * const AdditionalLoggerLive = Logger.layer(
 *   [Logger.consoleJson],
 *   { mergeWithExisting: true }
 * )
 *
 * // Using multiple logger formats
 * const jsonLogger = Logger.consoleJson
 * const prettyLogger = Logger.consolePretty()
 *
 * const CustomLoggerLive = Logger.layer([jsonLogger, prettyLogger])
 *
 * const program = Effect.log("Application started").pipe(
 *   Effect.provide(CustomLoggerLive)
 * )
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
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary =
  "Creates a `Layer` which will overwrite the current set of loggers with the specified array of `loggers`.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Single logger layer\nconst JsonLoggerLive = Logger.layer([Logger.consoleJson])\n\n// Multiple loggers layer\nconst MultiLoggerLive = Logger.layer([\n  Logger.consoleJson,\n  Logger.consolePretty(),\n  Logger.formatStructured\n])\n\n// Merge with existing loggers\nconst AdditionalLoggerLive = Logger.layer(\n  [Logger.consoleJson],\n  { mergeWithExisting: true }\n)\n\n// Using multiple logger formats\nconst jsonLogger = Logger.consoleJson\nconst prettyLogger = Logger.consolePretty()\n\nconst CustomLoggerLive = Logger.layer([jsonLogger, prettyLogger])\n\nconst program = Effect.log("Application started").pipe(\n  Effect.provide(CustomLoggerLive)\n)';
const moduleRecord = LoggerModule as Record<string, unknown>;

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
