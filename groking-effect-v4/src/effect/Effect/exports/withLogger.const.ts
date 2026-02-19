/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: withLogger
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.397Z
 *
 * Overview:
 * Adds a logger to the set of loggers which will output logs for this effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Create a custom logger that logs to the console
 * const customLogger = Logger.make(({ message }) =>
 *   Effect.sync(() => console.log(`[CUSTOM]: ${message}`))
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("This will go to both default and custom logger")
 *   return "completed"
 * })
 *
 * // Add the custom logger to the effect
 * const programWithLogger = Effect.withLogger(program, customLogger)
 *
 * Effect.runPromise(programWithLogger)
 * // Output includes both default and custom log outputs
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withLogger";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Adds a logger to the set of loggers which will output logs for this effect.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Create a custom logger that logs to the console\nconst customLogger = Logger.make(({ message }) =>\n  Effect.sync(() => console.log(`[CUSTOM]: ${message}`))\n)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.log("This will go to both default and custom logger")\n  return "completed"\n})\n\n// Add the custom logger to the effect\nconst programWithLogger = Effect.withLogger(program, customLogger)\n\nEffect.runPromise(programWithLogger)\n// Output includes both default and custom log outputs';
const moduleRecord = EffectModule as Record<string, unknown>;

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
