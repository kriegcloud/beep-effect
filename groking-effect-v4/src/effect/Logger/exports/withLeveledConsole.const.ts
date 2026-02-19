/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: withLeveledConsole
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * Returns a new `Logger` that writes all output of the specified `Logger` to the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * const formatter = Logger.make((options) =>
 *   `[${options.logLevel}] ${options.message}`
 * )
 *
 * const leveledLogger = Logger.withLeveledConsole(formatter)
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.logInfo("Info message") // -> console.info
 *   yield* Effect.logWarning("Warning") // -> console.warn
 *   yield* Effect.logError("Error occurred") // -> console.error
 *   yield* Effect.logDebug("Debug info") // -> console.debug
 * }).pipe(
 *   Effect.provide(Logger.layer([leveledLogger]))
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
const exportName = "withLeveledConsole";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "Returns a new `Logger` that writes all output of the specified `Logger` to the console.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\nconst formatter = Logger.make((options) =>\n  `[${options.logLevel}] ${options.message}`\n)\n\nconst leveledLogger = Logger.withLeveledConsole(formatter)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.logInfo("Info message") // -> console.info\n  yield* Effect.logWarning("Warning") // -> console.warn\n  yield* Effect.logError("Error occurred") // -> console.error\n  yield* Effect.logDebug("Debug info") // -> console.debug\n}).pipe(\n  Effect.provide(Logger.layer([leveledLogger]))\n)';
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
