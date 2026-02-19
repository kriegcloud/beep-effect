/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: defaultLogger
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.510Z
 *
 * Overview:
 * The default logging implementation used by the Effect runtime.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Use the default logger (automatically used by Effect runtime)
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("This uses the default logger")
 *   yield* Effect.logInfo("Info message")
 *   yield* Effect.logError("Error message")
 * })
 *
 * // Explicitly use the default logger
 * const withDefaultLogger = Effect.log("Explicit default").pipe(
 *   Effect.provide(Logger.layer([Logger.defaultLogger]))
 * )
 *
 * // Compare with custom logger
 * const customLogger = Logger.make((options) => {
 *   console.log(`CUSTOM: ${options.message}`)
 * })
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
const exportName = "defaultLogger";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "The default logging implementation used by the Effect runtime.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Use the default logger (automatically used by Effect runtime)\nconst program = Effect.gen(function*() {\n  yield* Effect.log("This uses the default logger")\n  yield* Effect.logInfo("Info message")\n  yield* Effect.logError("Error message")\n})\n\n// Explicitly use the default logger\nconst withDefaultLogger = Effect.log("Explicit default").pipe(\n  Effect.provide(Logger.layer([Logger.defaultLogger]))\n)\n\n// Compare with custom logger\nconst customLogger = Logger.make((options) => {\n  console.log(`CUSTOM: ${options.message}`)\n})';
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
