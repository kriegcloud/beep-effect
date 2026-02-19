/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runPromiseWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Executes an effect as a Promise with the provided services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ServiceMap } from "effect"
 *
 * interface Config {
 *   apiUrl: string
 * }
 *
 * const Config = ServiceMap.Service<Config>("Config")
 *
 * const services = ServiceMap.make(Config, {
 *   apiUrl: "https://api.example.com"
 * })
 *
 * const program = Effect.gen(function*() {
 *   const config = yield* Config
 *   return `Connecting to ${config.apiUrl}`
 * })
 *
 * Effect.runPromiseWith(services)(program).then(console.log)
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
const exportName = "runPromiseWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Executes an effect as a Promise with the provided services.";
const sourceExample =
  'import { Effect, ServiceMap } from "effect"\n\ninterface Config {\n  apiUrl: string\n}\n\nconst Config = ServiceMap.Service<Config>("Config")\n\nconst services = ServiceMap.make(Config, {\n  apiUrl: "https://api.example.com"\n})\n\nconst program = Effect.gen(function*() {\n  const config = yield* Config\n  return `Connecting to ${config.apiUrl}`\n})\n\nEffect.runPromiseWith(services)(program).then(console.log)';
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
