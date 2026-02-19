/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runSyncWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.914Z
 *
 * Overview:
 * Executes an effect synchronously with provided services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ServiceMap } from "effect"
 *
 * interface MathService {
 *   add: (a: number, b: number) => number
 * }
 *
 * const MathService = ServiceMap.Service<MathService>("MathService")
 *
 * const services = ServiceMap.make(MathService, {
 *   add: (a, b) => a + b
 * })
 *
 * const program = Effect.gen(function*() {
 *   const math = yield* MathService
 *   return math.add(2, 3)
 * })
 *
 * const result = Effect.runSyncWith(services)(program)
 * console.log(result) // 5
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
const exportName = "runSyncWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Executes an effect synchronously with provided services.";
const sourceExample =
  'import { Effect, ServiceMap } from "effect"\n\ninterface MathService {\n  add: (a: number, b: number) => number\n}\n\nconst MathService = ServiceMap.Service<MathService>("MathService")\n\nconst services = ServiceMap.make(MathService, {\n  add: (a, b) => a + b\n})\n\nconst program = Effect.gen(function*() {\n  const math = yield* MathService\n  return math.add(2, 3)\n})\n\nconst result = Effect.runSyncWith(services)(program)\nconsole.log(result) // 5';
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
