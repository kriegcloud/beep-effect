/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromSubscription
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.439Z
 *
 * Overview:
 * Creates a stream from a PubSub subscription.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, PubSub, Stream } from "effect"
 *
 * const program = Effect.scoped(Effect.gen(function*() {
 *   const pubsub = yield* PubSub.unbounded<number>()
 *   const subscription = yield* PubSub.subscribe(pubsub)
 *
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *
 *   const stream = Stream.fromSubscription(subscription)
 *   const values = yield* stream.pipe(Stream.take(2), Stream.runCollect)
 *   yield* Console.log(values)
 * }))
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2 ]
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
const exportName = "fromSubscription";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a PubSub subscription.";
const sourceExample =
  'import { Console, Effect, PubSub, Stream } from "effect"\n\nconst program = Effect.scoped(Effect.gen(function*() {\n  const pubsub = yield* PubSub.unbounded<number>()\n  const subscription = yield* PubSub.subscribe(pubsub)\n\n  yield* PubSub.publish(pubsub, 1)\n  yield* PubSub.publish(pubsub, 2)\n\n  const stream = Stream.fromSubscription(subscription)\n  const values = yield* stream.pipe(Stream.take(2), Stream.runCollect)\n  yield* Console.log(values)\n}))\n\nEffect.runPromise(program)\n// Output: [ 1, 2 ]';
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
