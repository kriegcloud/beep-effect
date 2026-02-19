/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.224Z
 *
 * Overview:
 * Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this channel. The result is a channel that will first perform the functions of this channel, before performing the functions of the created channel (including yielding its terminal value).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ProcessError extends Data.TaggedError("ProcessError")<{
 *   readonly cause: string
 * }> {}
 *
 * // Create a channel that outputs numbers
 * const numberChannel = Channel.fromIterable([1, 2, 3])
 *
 * // FlatMap each number to create new channels
 * const flatMappedChannel = Channel.flatMap(
 *   numberChannel,
 *   (n) =>
 *     Channel.fromIterable(Array.from({ length: n }, (_, i) => `item-${n}-${i}`))
 * )
 *
 * // Flattens nested channels into a single stream
 * // Outputs: "item-1-0", "item-2-0", "item-2-1", "item-3-0", "item-3-1", "item-3-2"
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this c...";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass ProcessError extends Data.TaggedError("ProcessError")<{\n  readonly cause: string\n}> {}\n\n// Create a channel that outputs numbers\nconst numberChannel = Channel.fromIterable([1, 2, 3])\n\n// FlatMap each number to create new channels\nconst flatMappedChannel = Channel.flatMap(\n  numberChannel,\n  (n) =>\n    Channel.fromIterable(Array.from({ length: n }, (_, i) => `item-${n}-${i}`))\n)\n\n// Flattens nested channels into a single stream\n// Outputs: "item-1-0", "item-2-0", "item-2-1", "item-3-0", "item-3-1", "item-3-2"';
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
