/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: mergeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.639Z
 *
 * Overview:
 * Merges multiple channels with specified concurrency and buffering options.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class MergeAllError extends Data.TaggedError("MergeAllError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create channels that output other channels
 * const nestedChannels = Channel.fromIterable([
 *   Channel.fromIterable([1, 2]),
 *   Channel.fromIterable([3, 4]),
 *   Channel.fromIterable([5, 6])
 * ])
 *
 * // Merge all channels with bounded concurrency
 * const mergedChannel = Channel.mergeAll({
 *   concurrency: 2,
 *   bufferSize: 16
 * })(nestedChannels)
 *
 * // Outputs: 1, 2, 3, 4, 5, 6 (order may vary due to concurrency)
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mergeAll";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Merges multiple channels with specified concurrency and buffering options.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass MergeAllError extends Data.TaggedError("MergeAllError")<{\n  readonly reason: string\n}> {}\n\n// Create channels that output other channels\nconst nestedChannels = Channel.fromIterable([\n  Channel.fromIterable([1, 2]),\n  Channel.fromIterable([3, 4]),\n  Channel.fromIterable([5, 6])\n])\n\n// Merge all channels with bounded concurrency\nconst mergedChannel = Channel.mergeAll({\n  concurrency: 2,\n  bufferSize: 16\n})(nestedChannels)\n\n// Outputs: 1, 2, 3, 4, 5, 6 (order may vary due to concurrency)';
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
