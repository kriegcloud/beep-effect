/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: formatSimple
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * A `Logger` which outputs logs as a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Use the simple format logger
 * const simpleLoggerProgram = Effect.log("Hello Simple Format").pipe(
 *   Effect.provide(Logger.layer([Logger.formatSimple]))
 * )
 *
 * // Combine with console output
 * const consoleSimpleLogger = Logger.withConsoleLog(Logger.formatSimple)
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("Application started")
 *   yield* Effect.logInfo("Processing data")
 *   yield* Effect.logWarning("Memory usage high")
 * }).pipe(
 *   Effect.provide(Logger.layer([consoleSimpleLogger]))
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
const exportName = "formatSimple";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which outputs logs as a string.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Use the simple format logger\nconst simpleLoggerProgram = Effect.log("Hello Simple Format").pipe(\n  Effect.provide(Logger.layer([Logger.formatSimple]))\n)\n\n// Combine with console output\nconst consoleSimpleLogger = Logger.withConsoleLog(Logger.formatSimple)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.log("Application started")\n  yield* Effect.logInfo("Processing data")\n  yield* Effect.logWarning("Memory usage high")\n}).pipe(\n  Effect.provide(Logger.layer([consoleSimpleLogger]))\n)';
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
