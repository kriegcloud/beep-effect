/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runForkWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.914Z
 *
 * Overview:
 * Runs an effect in the background with the provided services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ServiceMap } from "effect"
 *
 * interface Logger {
 *   log: (message: string) => void
 * }
 *
 * const Logger = ServiceMap.Service<Logger>("Logger")
 *
 * const services = ServiceMap.make(Logger, {
 *   log: (message) => console.log(message)
 * })
 *
 * const program = Effect.gen(function*() {
 *   const logger = yield* Logger
 *   logger.log("Hello from service!")
 *   return "done"
 * })
 *
 * const fiber = Effect.runForkWith(services)(program)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runForkWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs an effect in the background with the provided services.";
const sourceExample =
  'import { Effect, ServiceMap } from "effect"\n\ninterface Logger {\n  log: (message: string) => void\n}\n\nconst Logger = ServiceMap.Service<Logger>("Logger")\n\nconst services = ServiceMap.make(Logger, {\n  log: (message) => console.log(message)\n})\n\nconst program = Effect.gen(function*() {\n  const logger = yield* Logger\n  logger.log("Hello from service!")\n  return "done"\n})\n\nconst fiber = Effect.runForkWith(services)(program)';
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
