/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromPubSubTake
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.439Z
 *
 * Overview:
 * Creates a stream from a PubSub of `Take` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, PubSub, Stream, Take } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.unbounded<Take.Take<number, string>>({
 *     replay: 3
 *   })
 *
 *   yield* PubSub.publish(pubsub, [1])
 *   yield* PubSub.publish(pubsub, [2])
 *   yield* PubSub.publish(pubsub, Exit.succeed<void>(undefined))
 *
 *   const values = yield* Stream.fromPubSubTake(pubsub).pipe(Stream.runCollect)
 *   yield* Console.log(values)
 * })
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
const exportName = "fromPubSubTake";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a PubSub of `Take` values.";
const sourceExample =
  'import { Console, Effect, Exit, PubSub, Stream, Take } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.unbounded<Take.Take<number, string>>({\n    replay: 3\n  })\n\n  yield* PubSub.publish(pubsub, [1])\n  yield* PubSub.publish(pubsub, [2])\n  yield* PubSub.publish(pubsub, Exit.succeed<void>(undefined))\n\n  const values = yield* Stream.fromPubSubTake(pubsub).pipe(Stream.runCollect)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2 ]';
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
