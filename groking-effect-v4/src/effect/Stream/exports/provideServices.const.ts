/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: provideServices
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Provides multiple services to the stream using a service map.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap, Stream } from "effect"
 *
 * class Config extends ServiceMap.Service<Config, { readonly prefix: string }>()("Config") {}
 * class Greeter extends ServiceMap.Service<Greeter, { greet: (name: string) => string }>()("Greeter") {}
 *
 * const services = ServiceMap.make(Config, { prefix: "Hello" }).pipe(
 *   ServiceMap.add(Greeter, { greet: (name: string) => `${name}!` })
 * )
 *
 * const stream = Stream.fromEffect(
 *   Effect.gen(function*() {
 *     const config = yield* Effect.service(Config)
 *     const greeter = yield* Effect.service(Greeter)
 *     return greeter.greet(config.prefix)
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(Stream.provideServices(stream, services))
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // ["Hello!"]
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
const exportName = "provideServices";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Provides multiple services to the stream using a service map.";
const sourceExample =
  'import { Console, Effect, ServiceMap, Stream } from "effect"\n\nclass Config extends ServiceMap.Service<Config, { readonly prefix: string }>()("Config") {}\nclass Greeter extends ServiceMap.Service<Greeter, { greet: (name: string) => string }>()("Greeter") {}\n\nconst services = ServiceMap.make(Config, { prefix: "Hello" }).pipe(\n  ServiceMap.add(Greeter, { greet: (name: string) => `${name}!` })\n)\n\nconst stream = Stream.fromEffect(\n  Effect.gen(function*() {\n    const config = yield* Effect.service(Config)\n    const greeter = yield* Effect.service(Greeter)\n    return greeter.greet(config.prefix)\n  })\n)\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.runCollect(Stream.provideServices(stream, services))\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// ["Hello!"]';
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
