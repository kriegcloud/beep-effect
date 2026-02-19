/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: provideService
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * The `provideService` function is used to provide an actual implementation for a service in the context of an effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap } from "effect"
 *
 * // Define a service for configuration
 * const Config = ServiceMap.Service<{
 *   apiUrl: string
 *   timeout: number
 * }>("Config")
 *
 * const fetchData = Effect.gen(function*() {
 *   const config = yield* Effect.service(Config)
 *   yield* Console.log(`Fetching from: ${config.apiUrl}`)
 *   yield* Console.log(`Timeout: ${config.timeout}ms`)
 *   return "data"
 * })
 *
 * // Provide the service implementation
 * const program = Effect.provideService(fetchData, Config, {
 *   apiUrl: "https://api.example.com",
 *   timeout: 5000
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Fetching from: https://api.example.com
 * // Timeout: 5000ms
 * // data
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
const exportName = "provideService";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "The `provideService` function is used to provide an actual implementation for a service in the context of an effect.";
const sourceExample =
  'import { Console, Effect, ServiceMap } from "effect"\n\n// Define a service for configuration\nconst Config = ServiceMap.Service<{\n  apiUrl: string\n  timeout: number\n}>("Config")\n\nconst fetchData = Effect.gen(function*() {\n  const config = yield* Effect.service(Config)\n  yield* Console.log(`Fetching from: ${config.apiUrl}`)\n  yield* Console.log(`Timeout: ${config.timeout}ms`)\n  return "data"\n})\n\n// Provide the service implementation\nconst program = Effect.provideService(fetchData, Config, {\n  apiUrl: "https://api.example.com",\n  timeout: 5000\n})\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Fetching from: https://api.example.com\n// Timeout: 5000ms\n// data';
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
