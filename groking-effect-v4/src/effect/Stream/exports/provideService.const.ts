/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: provideService
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.467Z
 *
 * Overview:
 * Provides the stream with a single required service, eliminating that requirement from its environment.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap, Stream } from "effect"
 *
 * class Greeter extends ServiceMap.Service<Greeter, {
 *   greet: (name: string) => string
 * }>()("Greeter") {}
 *
 * const stream = Stream.fromEffect(
 *   Effect.service(Greeter).pipe(
 *     Effect.map((greeter) => greeter.greet("Ada"))
 *   )
 * )
 *
 * const program = Effect.gen(function*() {
 *   const collected = yield* Stream.runCollect(
 *     stream.pipe(
 *       Stream.provideService(Greeter, {
 *         greet: (name) => `Hello, ${name}`
 *       })
 *     )
 *   )
 *   yield* Console.log(collected)
 * })
 *
 * Effect.runPromise(program)
 * //=> ["Hello, Ada"]
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "provideService";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Provides the stream with a single required service, eliminating that requirement from its environment.";
const sourceExample =
  'import { Console, Effect, ServiceMap, Stream } from "effect"\n\nclass Greeter extends ServiceMap.Service<Greeter, {\n  greet: (name: string) => string\n}>()("Greeter") {}\n\nconst stream = Stream.fromEffect(\n  Effect.service(Greeter).pipe(\n    Effect.map((greeter) => greeter.greet("Ada"))\n  )\n)\n\nconst program = Effect.gen(function*() {\n  const collected = yield* Stream.runCollect(\n    stream.pipe(\n      Stream.provideService(Greeter, {\n        greet: (name) => `Hello, ${name}`\n      })\n    )\n  )\n  yield* Console.log(collected)\n})\n\nEffect.runPromise(program)\n//=> ["Hello, Ada"]';
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
