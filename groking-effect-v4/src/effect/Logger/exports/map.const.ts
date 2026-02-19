/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * Transforms the output of a `Logger` using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Logger } from "effect"
 * 
 * // Create a logger that outputs objects
 * const structuredLogger = Logger.make((options) => ({
 *   level: options.logLevel,
 *   message: options.message,
 *   timestamp: options.date.toISOString()
 * }))
 * 
 * // Transform the output to JSON strings
 * const jsonStringLogger = Logger.map(
 *   structuredLogger,
 *   (output) => JSON.stringify(output)
 * )
 * 
 * // Transform to uppercase messages
 * const uppercaseLogger = Logger.map(
 *   structuredLogger,
 *   (output) => ({ ...output, message: String(output.message).toUpperCase() })
 * )
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
import * as LoggerModule from "effect/Logger";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "Transforms the output of a `Logger` using the provided function.";
const sourceExample = "import { Logger } from \"effect\"\n\n// Create a logger that outputs objects\nconst structuredLogger = Logger.make((options) => ({\n  level: options.logLevel,\n  message: options.message,\n  timestamp: options.date.toISOString()\n}))\n\n// Transform the output to JSON strings\nconst jsonStringLogger = Logger.map(\n  structuredLogger,\n  (output) => JSON.stringify(output)\n)\n\n// Transform to uppercase messages\nconst uppercaseLogger = Logger.map(\n  structuredLogger,\n  (output) => ({ ...output, message: String(output.message).toUpperCase() })\n)";
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
