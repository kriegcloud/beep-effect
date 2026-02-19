/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: withConsoleError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:50:37.427Z
 *
 * Overview:
 * Returns a new `Logger` that writes all output of the specified `Logger` to the console using `console.error`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Create an error-specific formatter
 * const errorFormatter = Logger.make((options) =>
 *   `ERROR [${options.date.toISOString()}]: ${options.message}`
 * )
 *
 * // Route to console.error
 * const errorLogger = Logger.withConsoleError(errorFormatter)
 *
 * const program = Effect.logError("Database connection failed").pipe(
 *   Effect.provide(Logger.layer([errorLogger]))
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
const exportName = "withConsoleError";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary =
  "Returns a new `Logger` that writes all output of the specified `Logger` to the console using `console.error`.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Create an error-specific formatter\nconst errorFormatter = Logger.make((options) =>\n  `ERROR [${options.date.toISOString()}]: ${options.message}`\n)\n\n// Route to console.error\nconst errorLogger = Logger.withConsoleError(errorFormatter)\n\nconst program = Effect.logError("Database connection failed").pipe(\n  Effect.provide(Logger.layer([errorLogger]))\n)';
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
