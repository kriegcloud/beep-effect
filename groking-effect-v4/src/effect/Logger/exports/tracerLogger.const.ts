/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: tracerLogger
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * A `Logger` which includes log messages as tracer span events.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Tracer logger is included by default - logs automatically become span events
 * const defaultProgram = Effect.gen(function*() {
 *   yield* Effect.log("This automatically becomes a span event")
 *   yield* Effect.logInfo("Processing data")
 * })
 *
 * // Explicitly combine tracer logger with other loggers
 * const observabilityProgram = Effect.gen(function*() {
 *   yield* Effect.log("Operation started")
 *   yield* Effect.logInfo("Processing data")
 *   yield* Effect.logError("Error occurred")
 * }).pipe(
 *   Effect.withLogSpan("data-processing"),
 *   Effect.provide(Logger.layer([
 *     Logger.tracerLogger,
 *     Logger.consoleJson
 *   ]))
 * )
 *
 * // Perfect for correlating logs with traces in distributed systems
 * const distributedProgram = Effect.gen(function*() {
 *   yield* Effect.log("Step 1: Fetching user data")
 *   yield* Effect.sleep("100 millis")
 *   yield* Effect.log("Step 2: Processing payment")
 *   yield* Effect.sleep("200 millis")
 *   yield* Effect.log("Step 3: Sending confirmation")
 * }).pipe(
 *   Effect.withLogSpan("payment-workflow"),
 *   Effect.annotateLogs("userId", "user-123"),
 *   Effect.provide(Logger.layer([Logger.tracerLogger]))
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
const exportName = "tracerLogger";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which includes log messages as tracer span events.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Tracer logger is included by default - logs automatically become span events\nconst defaultProgram = Effect.gen(function*() {\n  yield* Effect.log("This automatically becomes a span event")\n  yield* Effect.logInfo("Processing data")\n})\n\n// Explicitly combine tracer logger with other loggers\nconst observabilityProgram = Effect.gen(function*() {\n  yield* Effect.log("Operation started")\n  yield* Effect.logInfo("Processing data")\n  yield* Effect.logError("Error occurred")\n}).pipe(\n  Effect.withLogSpan("data-processing"),\n  Effect.provide(Logger.layer([\n    Logger.tracerLogger,\n    Logger.consoleJson\n  ]))\n)\n\n// Perfect for correlating logs with traces in distributed systems\nconst distributedProgram = Effect.gen(function*() {\n  yield* Effect.log("Step 1: Fetching user data")\n  yield* Effect.sleep("100 millis")\n  yield* Effect.log("Step 2: Processing payment")\n  yield* Effect.sleep("200 millis")\n  yield* Effect.log("Step 3: Sending confirmation")\n}).pipe(\n  Effect.withLogSpan("payment-workflow"),\n  Effect.annotateLogs("userId", "user-123"),\n  Effect.provide(Logger.layer([Logger.tracerLogger]))\n)';
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
