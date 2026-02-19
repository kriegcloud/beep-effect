/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromPubSub
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.452Z
 *
 * Overview:
 * Creates a stream from a subscription to a `PubSub`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Fiber, PubSub, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.unbounded<number>()
 *
 *   const fiber = yield* Stream.fromPubSub(pubsub).pipe(
 *     Stream.take(3),
 *     Stream.runCollect,
 *     Effect.forkChild
 *   )
 *
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *   yield* PubSub.publish(pubsub, 3)
 *
 *   const values = yield* Fiber.join(fiber)
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2, 3 ]
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
const exportName = "fromPubSub";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a subscription to a `PubSub`.";
const sourceExample =
  'import { Console, Effect, Fiber, PubSub, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.unbounded<number>()\n\n  const fiber = yield* Stream.fromPubSub(pubsub).pipe(\n    Stream.take(3),\n    Stream.runCollect,\n    Effect.forkChild\n  )\n\n  yield* PubSub.publish(pubsub, 1)\n  yield* PubSub.publish(pubsub, 2)\n  yield* PubSub.publish(pubsub, 3)\n\n  const values = yield* Fiber.join(fiber)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 3 ]';
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
