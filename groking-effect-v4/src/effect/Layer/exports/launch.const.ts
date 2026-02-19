/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: launch
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.318Z
 *
 * Overview:
 * Builds this layer and uses it until it is interrupted. This is useful when your entire application is a layer, such as an HTTP server.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Layer, ServiceMap } from "effect"
 *
 * class HttpServer extends ServiceMap.Service<HttpServer, {
 *   readonly start: () => Effect.Effect<string>
 *   readonly stop: () => Effect.Effect<string>
 * }>()("HttpServer") {}
 *
 * class Logger extends ServiceMap.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Server layer that starts an HTTP server
 * const serverLayer = Layer.effect(HttpServer)(Effect.gen(function*() {
 *   yield* Console.log("Starting HTTP server...")
 *
 *   return {
 *     start: () =>
 *       Effect.gen(function*() {
 *         yield* Console.log("Server listening on port 3000")
 *         return "Server started"
 *       }),
 *     stop: () =>
 *       Effect.gen(function*() {
 *         yield* Console.log("Server stopped gracefully")
 *         return "Server stopped"
 *       })
 *   }
 * }))
 *
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: (msg: string) => Console.log(`[LOG] ${msg}`)
 * })
 *
 * // Application layer combining all services
 * const appLayer = Layer.mergeAll(serverLayer, loggerLayer)
 *
 * // Launch the application - runs until interrupted
 * const application = appLayer.pipe(
 *   Layer.launch,
 *   Effect.tapError((error) => Console.log(`Application failed: ${error}`)),
 *   Effect.tap(() => Console.log("Application completed"))
 * )
 *
 * // This will run forever until externally interrupted
 * // Effect.runFork(application)
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
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "launch";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary =
  "Builds this layer and uses it until it is interrupted. This is useful when your entire application is a layer, such as an HTTP server.";
const sourceExample =
  'import { Console, Effect, Layer, ServiceMap } from "effect"\n\nclass HttpServer extends ServiceMap.Service<HttpServer, {\n  readonly start: () => Effect.Effect<string>\n  readonly stop: () => Effect.Effect<string>\n}>()("HttpServer") {}\n\nclass Logger extends ServiceMap.Service<Logger, {\n  readonly log: (msg: string) => Effect.Effect<void>\n}>()("Logger") {}\n\n// Server layer that starts an HTTP server\nconst serverLayer = Layer.effect(HttpServer)(Effect.gen(function*() {\n  yield* Console.log("Starting HTTP server...")\n\n  return {\n    start: () =>\n      Effect.gen(function*() {\n        yield* Console.log("Server listening on port 3000")\n        return "Server started"\n      }),\n    stop: () =>\n      Effect.gen(function*() {\n        yield* Console.log("Server stopped gracefully")\n        return "Server stopped"\n      })\n  }\n}))\n\nconst loggerLayer = Layer.succeed(Logger)({\n  log: (msg: string) => Console.log(`[LOG] ${msg}`)\n})\n\n// Application layer combining all services\nconst appLayer = Layer.mergeAll(serverLayer, loggerLayer)\n\n// Launch the application - runs until interrupted\nconst application = appLayer.pipe(\n  Layer.launch,\n  Effect.tapError((error) => Console.log(`Application failed: ${error}`)),\n  Effect.tap(() => Console.log("Application completed"))\n)\n\n// This will run forever until externally interrupted\n// Effect.runFork(application)';
const moduleRecord = LayerModule as Record<string, unknown>;

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
