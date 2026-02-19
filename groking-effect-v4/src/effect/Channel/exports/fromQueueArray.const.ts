/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromQueueArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.226Z
 *
 * Overview:
 * Create a channel from a queue that emits arrays of elements
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect, Queue } from "effect"
 *
 * class ProcessingError extends Data.TaggedError("ProcessingError")<{
 *   readonly stage: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a queue for batch processing
 *   const queue = yield* Queue.bounded<number, ProcessingError>(100)
 *
 *   // Fill queue with data
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
 *
 *   // Create a channel that reads arrays from the queue
 *   const arrayChannel = Channel.fromQueueArray(queue)
 *
 *   // This will emit non-empty arrays of elements instead of individual items
 *   // Useful for batch processing scenarios
 *   return arrayChannel
 * })
 *
 * // High-throughput processing example
 * const batchProcessor = Effect.gen(function*() {
 *   const dataQueue = yield* Queue.dropping<string, ProcessingError>(1000)
 *   const batchChannel = Channel.fromQueueArray(dataQueue)
 *
 *   // Process data in batches for better performance
 *   return Channel.map(
 *     batchChannel,
 *     (batch) => batch.map((item) => item.toUpperCase())
 *   )
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
const exportName = "fromQueueArray";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Create a channel from a queue that emits arrays of elements";
const sourceExample =
  'import { Channel, Data, Effect, Queue } from "effect"\n\nclass ProcessingError extends Data.TaggedError("ProcessingError")<{\n  readonly stage: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a queue for batch processing\n  const queue = yield* Queue.bounded<number, ProcessingError>(100)\n\n  // Fill queue with data\n  yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\n\n  // Create a channel that reads arrays from the queue\n  const arrayChannel = Channel.fromQueueArray(queue)\n\n  // This will emit non-empty arrays of elements instead of individual items\n  // Useful for batch processing scenarios\n  return arrayChannel\n})\n\n// High-throughput processing example\nconst batchProcessor = Effect.gen(function*() {\n  const dataQueue = yield* Queue.dropping<string, ProcessingError>(1000)\n  const batchChannel = Channel.fromQueueArray(dataQueue)\n\n  // Process data in batches for better performance\n  return Channel.map(\n    batchChannel,\n    (batch) => batch.map((item) => item.toUpperCase())\n  )\n})';
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
