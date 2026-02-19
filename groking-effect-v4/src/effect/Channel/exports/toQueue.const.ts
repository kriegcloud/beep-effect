/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: toQueue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.230Z
 *
 * Overview:
 * Converts a channel to a queue for concurrent consumption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class QueueError extends Data.TaggedError("QueueError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a channel with data
 * const dataChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Convert to queue for concurrent processing
 * const queueEffect = Channel.toQueue(dataChannel, { capacity: 32 })
 *
 * // The queue can be used for concurrent consumption
 * // Multiple consumers can read from the queue
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
const exportName = "toQueue";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Converts a channel to a queue for concurrent consumption.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass QueueError extends Data.TaggedError("QueueError")<{\n  readonly operation: string\n}> {}\n\n// Create a channel with data\nconst dataChannel = Channel.fromIterable([1, 2, 3, 4, 5])\n\n// Convert to queue for concurrent processing\nconst queueEffect = Channel.toQueue(dataChannel, { capacity: 32 })\n\n// The queue can be used for concurrent consumption\n// Multiple consumers can read from the queue';
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
