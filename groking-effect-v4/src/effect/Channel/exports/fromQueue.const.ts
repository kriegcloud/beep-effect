/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromQueue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.225Z
 *
 * Overview:
 * Create a channel from a queue
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect, Queue } from "effect"
 *
 * class QueueError extends Data.TaggedError("QueueError")<{
 *   readonly reason: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a bounded queue
 *   const queue = yield* Queue.bounded<string, QueueError>(10)
 *
 *   // Add some items to the queue
 *   yield* Queue.offer(queue, "item1")
 *   yield* Queue.offer(queue, "item2")
 *   yield* Queue.offer(queue, "item3")
 *
 *   // Create a channel from the queue
 *   const channel = Channel.fromQueue(queue)
 *
 *   // The channel will read items from the queue one by one
 *   return channel
 * })
 *
 * // Sliding queue example
 * const slidingProgram = Effect.gen(function*() {
 *   const slidingQueue = yield* Queue.sliding<number, QueueError>(5)
 *   yield* Queue.offerAll(slidingQueue, [1, 2, 3, 4, 5, 6])
 *   return Channel.fromQueue(slidingQueue)
 * })
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromQueue";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Create a channel from a queue";
const sourceExample =
  'import { Channel, Data, Effect, Queue } from "effect"\n\nclass QueueError extends Data.TaggedError("QueueError")<{\n  readonly reason: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a bounded queue\n  const queue = yield* Queue.bounded<string, QueueError>(10)\n\n  // Add some items to the queue\n  yield* Queue.offer(queue, "item1")\n  yield* Queue.offer(queue, "item2")\n  yield* Queue.offer(queue, "item3")\n\n  // Create a channel from the queue\n  const channel = Channel.fromQueue(queue)\n\n  // The channel will read items from the queue one by one\n  return channel\n})\n\n// Sliding queue example\nconst slidingProgram = Effect.gen(function*() {\n  const slidingQueue = yield* Queue.sliding<number, QueueError>(5)\n  yield* Queue.offerAll(slidingQueue, [1, 2, 3, 4, 5, 6])\n  return Channel.fromQueue(slidingQueue)\n})';
const moduleRecord = ChannelModule as Record<string, unknown>;

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
