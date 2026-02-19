/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: provide
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Provides a layer or service map to the stream, removing the corresponding service requirements. Use `options.local` to build the layer every time; by default, layers are shared between provide calls.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Layer, ServiceMap, Stream } from "effect"
 *
 * class Env extends ServiceMap.Service<Env, { readonly name: string }>()("Env") {}
 *
 * const layer = Layer.succeed(Env)({ name: "Ada" })
 *
 * const stream = Stream.fromEffect(
 *   Effect.gen(function*() {
 *     const env = yield* Effect.service(Env)
 *     return `Hello, ${env.name}`
 *   })
 * )
 *
 * const withEnv = stream.pipe(Stream.provide(layer))
 *
 * const program = Stream.runCollect(withEnv).pipe(
 *   Effect.flatMap((values) => Console.log(values))
 * )
 *
 * Effect.runPromise(program)
 * // Output:
 * // ["Hello, Ada"]
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
const exportName = "provide";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Provides a layer or service map to the stream, removing the corresponding service requirements. Use `options.local` to build the layer every time; by default, layers are shared ...";
const sourceExample =
  'import { Console, Effect, Layer, ServiceMap, Stream } from "effect"\n\nclass Env extends ServiceMap.Service<Env, { readonly name: string }>()("Env") {}\n\nconst layer = Layer.succeed(Env)({ name: "Ada" })\n\nconst stream = Stream.fromEffect(\n  Effect.gen(function*() {\n    const env = yield* Effect.service(Env)\n    return `Hello, ${env.name}`\n  })\n)\n\nconst withEnv = stream.pipe(Stream.provide(layer))\n\nconst program = Stream.runCollect(withEnv).pipe(\n  Effect.flatMap((values) => Console.log(values))\n)\n\nEffect.runPromise(program)\n// Output:\n// ["Hello, Ada"]';
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
