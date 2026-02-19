/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runCallbackWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Forks an effect with the provided services, registers `onExit` as a fiber observer, and returns an interruptor.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, ServiceMap } from "effect"
 *
 * interface Logger {
 *   log: (message: string) => Effect.Effect<void>
 * }
 *
 * const Logger = ServiceMap.Service<Logger>("Logger")
 *
 * const services = ServiceMap.make(Logger, {
 *   log: (message) => Console.log(message)
 * })
 *
 * const program = Effect.gen(function*() {
 *   const logger = yield* Logger
 *   yield* logger.log("Started")
 *   return "done"
 * })
 *
 * const interrupt = Effect.runCallbackWith(services)(program, {
 *   onExit: (exit) => {
 *     if (Exit.isFailure(exit)) {
 *       // handle failure or interruption
 *     }
 *   }
 * })
 *
 * // Use the interruptor if you need to cancel the fiber later.
 * interrupt()
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
const exportName = "runCallbackWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Forks an effect with the provided services, registers `onExit` as a fiber observer, and returns an interruptor.";
const sourceExample =
  'import { Console, Effect, Exit, ServiceMap } from "effect"\n\ninterface Logger {\n  log: (message: string) => Effect.Effect<void>\n}\n\nconst Logger = ServiceMap.Service<Logger>("Logger")\n\nconst services = ServiceMap.make(Logger, {\n  log: (message) => Console.log(message)\n})\n\nconst program = Effect.gen(function*() {\n  const logger = yield* Logger\n  yield* logger.log("Started")\n  return "done"\n})\n\nconst interrupt = Effect.runCallbackWith(services)(program, {\n  onExit: (exit) => {\n    if (Exit.isFailure(exit)) {\n      // handle failure or interruption\n    }\n  }\n})\n\n// Use the interruptor if you need to cancel the fiber later.\ninterrupt()';
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
