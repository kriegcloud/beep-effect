/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:50:37.427Z
 *
 * Overview:
 * Creates a new `Logger` from a log function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 * import { CurrentLogAnnotations } from "effect/References"
 *
 * // Simple text logger
 * const textLogger = Logger.make((options) =>
 *   `${options.date.toISOString()} [${options.logLevel}] ${options.message}`
 * )
 *
 * // Structured object logger
 * const objectLogger = Logger.make((options) => ({
 *   timestamp: options.date.toISOString(),
 *   level: options.logLevel,
 *   message: options.message,
 *   fiberId: options.fiber.id,
 *   annotations: options.fiber.getRef(CurrentLogAnnotations)
 * }))
 *
 * // Custom filtering logger
 * const filteredLogger = Logger.make((options) => {
 *   if (options.logLevel === "Debug") {
 *     return // Skip debug messages
 *   }
 *   return `${options.logLevel}: ${options.message}`
 * })
 *
 * const program = Effect.log("Hello World").pipe(
 *   Effect.provide(Logger.layer([textLogger]))
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "Creates a new `Logger` from a log function.";
const sourceExample =
  'import { Effect, Logger } from "effect"\nimport { CurrentLogAnnotations } from "effect/References"\n\n// Simple text logger\nconst textLogger = Logger.make((options) =>\n  `${options.date.toISOString()} [${options.logLevel}] ${options.message}`\n)\n\n// Structured object logger\nconst objectLogger = Logger.make((options) => ({\n  timestamp: options.date.toISOString(),\n  level: options.logLevel,\n  message: options.message,\n  fiberId: options.fiber.id,\n  annotations: options.fiber.getRef(CurrentLogAnnotations)\n}))\n\n// Custom filtering logger\nconst filteredLogger = Logger.make((options) => {\n  if (options.logLevel === "Debug") {\n    return // Skip debug messages\n  }\n  return `${options.logLevel}: ${options.message}`\n})\n\nconst program = Effect.log("Hello World").pipe(\n  Effect.provide(Logger.layer([textLogger]))\n)';
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
