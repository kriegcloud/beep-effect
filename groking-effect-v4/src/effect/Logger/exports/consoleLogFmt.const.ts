/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: consoleLogFmt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.510Z
 *
 * Overview:
 * A `Logger` which outputs logs using the [logfmt](https://brandur.org/logfmt) style and writes them to the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Use the console logfmt logger
 * const logfmtProgram = Effect.log("Hello LogFmt Console").pipe(
 *   Effect.provide(Logger.layer([Logger.consoleLogFmt]))
 * )
 *
 * // Great for production environments
 * const productionProgram = Effect.gen(function*() {
 *   yield* Effect.log("Server started", { port: 8080, version: "1.0.0" })
 *   yield* Effect.logInfo("Request processed", { userId: 123, duration: 45 })
 *   yield* Effect.logError("Validation failed", {
 *     field: "email",
 *     value: "invalid"
 *   })
 * }).pipe(
 *   Effect.annotateLogs("service", "api"),
 *   Effect.withLogSpan("request-handler"),
 *   Effect.provide(Logger.layer([Logger.consoleLogFmt]))
 * )
 *
 * // Combine with other loggers
 * const multiLoggerLive = Logger.layer([
 *   Logger.consoleLogFmt,
 *   Logger.consolePretty()
 * ])
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
const exportName = "consoleLogFmt";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary =
  "A `Logger` which outputs logs using the [logfmt](https://brandur.org/logfmt) style and writes them to the console.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Use the console logfmt logger\nconst logfmtProgram = Effect.log("Hello LogFmt Console").pipe(\n  Effect.provide(Logger.layer([Logger.consoleLogFmt]))\n)\n\n// Great for production environments\nconst productionProgram = Effect.gen(function*() {\n  yield* Effect.log("Server started", { port: 8080, version: "1.0.0" })\n  yield* Effect.logInfo("Request processed", { userId: 123, duration: 45 })\n  yield* Effect.logError("Validation failed", {\n    field: "email",\n    value: "invalid"\n  })\n}).pipe(\n  Effect.annotateLogs("service", "api"),\n  Effect.withLogSpan("request-handler"),\n  Effect.provide(Logger.layer([Logger.consoleLogFmt]))\n)\n\n// Combine with other loggers\nconst multiLoggerLive = Logger.layer([\n  Logger.consoleLogFmt,\n  Logger.consolePretty()\n])';
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
