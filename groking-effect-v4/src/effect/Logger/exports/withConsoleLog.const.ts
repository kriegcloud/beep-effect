/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: withConsoleLog
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:50:37.427Z
 *
 * Overview:
 * Returns a new `Logger` that writes all output of the specified `Logger` to the console using `console.log`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Create a custom formatter
 * const customFormatter = Logger.make((options) =>
 *   `[${options.date.toISOString()}] ${options.logLevel}: ${options.message}`
 * )
 *
 * // Route to console
 * const consoleLogger = Logger.withConsoleLog(customFormatter)
 *
 * const program = Effect.log("Hello World").pipe(
 *   Effect.provide(Logger.layer([consoleLogger]))
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
const exportName = "withConsoleLog";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary =
  "Returns a new `Logger` that writes all output of the specified `Logger` to the console using `console.log`.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Create a custom formatter\nconst customFormatter = Logger.make((options) =>\n  `[${options.date.toISOString()}] ${options.logLevel}: ${options.message}`\n)\n\n// Route to console\nconst consoleLogger = Logger.withConsoleLog(customFormatter)\n\nconst program = Effect.log("Hello World").pipe(\n  Effect.provide(Logger.layer([consoleLogger]))\n)';
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
