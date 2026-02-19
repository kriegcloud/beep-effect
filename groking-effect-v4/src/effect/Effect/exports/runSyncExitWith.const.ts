/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runSyncExitWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Runs an effect synchronously with provided services, returning an Exit result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, ServiceMap } from "effect"
 *
 * // Define a logger service
 * const Logger = ServiceMap.Service<{
 *   log: (msg: string) => void
 * }>("Logger")
 *
 * const program = Effect.gen(function*() {
 *   const logger = yield* Effect.service(Logger)
 *   logger.log("Computing result...")
 *   return 42
 * })
 *
 * // Prepare services
 * const services = ServiceMap.make(Logger, {
 *   log: (msg) => console.log(`[LOG] ${msg}`)
 * })
 *
 * const exit = Effect.runSyncExitWith(services)(program)
 *
 * if (Exit.isSuccess(exit)) {
 *   console.log(`Success: ${exit.value}`)
 * } else {
 *   console.log(`Failure: ${exit.cause}`)
 * }
 * // Output:
 * // [LOG] Computing result...
 * // Success: 42
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
const exportName = "runSyncExitWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs an effect synchronously with provided services, returning an Exit result.";
const sourceExample =
  'import { Effect, Exit, ServiceMap } from "effect"\n\n// Define a logger service\nconst Logger = ServiceMap.Service<{\n  log: (msg: string) => void\n}>("Logger")\n\nconst program = Effect.gen(function*() {\n  const logger = yield* Effect.service(Logger)\n  logger.log("Computing result...")\n  return 42\n})\n\n// Prepare services\nconst services = ServiceMap.make(Logger, {\n  log: (msg) => console.log(`[LOG] ${msg}`)\n})\n\nconst exit = Effect.runSyncExitWith(services)(program)\n\nif (Exit.isSuccess(exit)) {\n  console.log(`Success: ${exit.value}`)\n} else {\n  console.log(`Failure: ${exit.cause}`)\n}\n// Output:\n// [LOG] Computing result...\n// Success: 42';
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
