/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: runIntoPubSub
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.443Z
 *
 * Overview:
 * Runs the stream, publishing elements into the provided PubSub.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, PubSub, Stream } from "effect"
 * 
 * const program = Effect.scoped(Effect.gen(function* () {
 *   const pubsub = yield* PubSub.unbounded<number>()
 *   const subscription = yield* PubSub.subscribe(pubsub)
 * 
 *   yield* Stream.runIntoPubSub(Stream.fromIterable([1, 2]), pubsub)
 * 
 *   const first = yield* PubSub.take(subscription)
 *   const second = yield* PubSub.take(subscription)
 * 
 *   yield* Console.log(first)
 *   yield* Console.log(second)
 * }))
 * 
 * Effect.runPromise(program)
 * //=> 1
 * //=> 2
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as StreamModule from "effect/Stream";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runIntoPubSub";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Runs the stream, publishing elements into the provided PubSub.";
const sourceExample = "import { Console, Effect, PubSub, Stream } from \"effect\"\n\nconst program = Effect.scoped(Effect.gen(function* () {\n  const pubsub = yield* PubSub.unbounded<number>()\n  const subscription = yield* PubSub.subscribe(pubsub)\n\n  yield* Stream.runIntoPubSub(Stream.fromIterable([1, 2]), pubsub)\n\n  const first = yield* PubSub.take(subscription)\n  const second = yield* PubSub.take(subscription)\n\n  yield* Console.log(first)\n  yield* Console.log(second)\n}))\n\nEffect.runPromise(program)\n//=> 1\n//=> 2";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
