/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: batched
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.510Z
 *
 * Overview:
 * Returns a new `Logger` which will aggregate logs output by the specified `Logger` over the provided `window`. After the `window` has elapsed, the provided `flush` function will be called with the logs aggregated during the last `window`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration, Effect, Logger } from "effect"
 * 
 * // Create a batched logger that flushes every 5 seconds
 * const batchedLogger = Logger.batched(Logger.formatJson, {
 *   window: Duration.seconds(5),
 *   flush: (messages) =>
 *     Effect.sync(() => {
 *       console.log(`Flushing ${messages.length} log entries:`)
 *       messages.forEach((msg, i) => console.log(`${i + 1}. ${msg}`))
 *     })
 * })
 * 
 * const program = Effect.gen(function*() {
 *   const logger = yield* batchedLogger
 * 
 *   yield* Effect.provide(
 *     Effect.all([
 *       Effect.log("Event 1"),
 *       Effect.log("Event 2"),
 *       Effect.log("Event 3"),
 *       Effect.sleep(Duration.seconds(6)), // Trigger flush
 *       Effect.log("Event 4")
 *     ]),
 *     Logger.layer([logger])
 *   )
 * })
 * 
 * // Remote batch logging example
 * const remoteBatchLogger = Logger.batched(Logger.formatStructured, {
 *   window: Duration.seconds(10),
 *   flush: (entries) =>
 *     Effect.sync(() => {
 *       // Send batch to remote logging service
 *       console.log(`Sending ${entries.length} log entries to remote service`)
 *     })
 * })
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
const exportName = "batched";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "Returns a new `Logger` which will aggregate logs output by the specified `Logger` over the provided `window`. After the `window` has elapsed, the provided `flush` function will ...";
const sourceExample = "import { Duration, Effect, Logger } from \"effect\"\n\n// Create a batched logger that flushes every 5 seconds\nconst batchedLogger = Logger.batched(Logger.formatJson, {\n  window: Duration.seconds(5),\n  flush: (messages) =>\n    Effect.sync(() => {\n      console.log(`Flushing ${messages.length} log entries:`)\n      messages.forEach((msg, i) => console.log(`${i + 1}. ${msg}`))\n    })\n})\n\nconst program = Effect.gen(function*() {\n  const logger = yield* batchedLogger\n\n  yield* Effect.provide(\n    Effect.all([\n      Effect.log(\"Event 1\"),\n      Effect.log(\"Event 2\"),\n      Effect.log(\"Event 3\"),\n      Effect.sleep(Duration.seconds(6)), // Trigger flush\n      Effect.log(\"Event 4\")\n    ]),\n    Logger.layer([logger])\n  )\n})\n\n// Remote batch logging example\nconst remoteBatchLogger = Logger.batched(Logger.formatStructured, {\n  window: Duration.seconds(10),\n  flush: (entries) =>\n    Effect.sync(() => {\n      // Send batch to remote logging service\n      console.log(`Sending ${entries.length} log entries to remote service`)\n    })\n})";
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
