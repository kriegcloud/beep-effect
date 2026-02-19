/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: CurrentLoggers
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:50:37.426Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Access current loggers from fiber context
 * const program = Effect.gen(function*() {
 *   const currentLoggers = yield* Effect.service(Logger.CurrentLoggers)
 *   console.log(`Number of active loggers: ${currentLoggers.size}`)
 *
 *   // Add a custom logger to the set
 *   const customLogger = Logger.make((options) => {
 *     console.log(`Custom: ${options.message}`)
 *   })
 *
 *   yield* Effect.log("Hello from custom logger").pipe(
 *     Effect.provide(Logger.layer([customLogger]))
 *   )
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CurrentLoggers";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Access current loggers from fiber context\nconst program = Effect.gen(function*() {\n  const currentLoggers = yield* Effect.service(Logger.CurrentLoggers)\n  console.log(`Number of active loggers: ${currentLoggers.size}`)\n\n  // Add a custom logger to the set\n  const customLogger = Logger.make((options) => {\n    console.log(`Custom: ${options.message}`)\n  })\n\n  yield* Effect.log("Hello from custom logger").pipe(\n    Effect.provide(Logger.layer([customLogger]))\n  )\n})';
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
