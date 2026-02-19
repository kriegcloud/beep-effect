/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: updateServices
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.446Z
 *
 * Overview:
 * Transforms the stream's required services by mapping the current service map to a new one.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap, Stream } from "effect"
 *
 * class Logger extends ServiceMap.Service<Logger, { prefix: string }>()("Logger") {}
 * class Config extends ServiceMap.Service<Config, { name: string }>()("Config") {}
 *
 * const stream = Stream.fromEffect(
 *   Effect.gen(function*() {
 *     const logger = yield* Effect.service(Logger)
 *     const config = yield* Effect.service(Config)
 *     return `${logger.prefix}${config.name}`
 *   })
 * )
 *
 * const updated = stream.pipe(
 *   Stream.updateServices((services: ServiceMap.ServiceMap<Logger>) =>
 *     ServiceMap.add(services, Config, { name: "World" })
 *   )
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(updated)
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(
 *   Effect.provideService(program, Logger, { prefix: "Hello " })
 * )
 * //=> [ "Hello World" ]
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "updateServices";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Transforms the stream's required services by mapping the current service map to a new one.";
const sourceExample =
  'import { Console, Effect, ServiceMap, Stream } from "effect"\n\nclass Logger extends ServiceMap.Service<Logger, { prefix: string }>()("Logger") {}\nclass Config extends ServiceMap.Service<Config, { name: string }>()("Config") {}\n\nconst stream = Stream.fromEffect(\n  Effect.gen(function*() {\n    const logger = yield* Effect.service(Logger)\n    const config = yield* Effect.service(Config)\n    return `${logger.prefix}${config.name}`\n  })\n)\n\nconst updated = stream.pipe(\n  Stream.updateServices((services: ServiceMap.ServiceMap<Logger>) =>\n    ServiceMap.add(services, Config, { name: "World" })\n  )\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(updated)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(\n  Effect.provideService(program, Logger, { prefix: "Hello " })\n)\n//=> [ "Hello World" ]';
const moduleRecord = StreamModule as Record<string, unknown>;

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
