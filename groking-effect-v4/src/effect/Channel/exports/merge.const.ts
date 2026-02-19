/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: merge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.227Z
 *
 * Overview:
 * Returns a new channel, which is the merge of this channel and the specified channel.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class MergeError extends Data.TaggedError("MergeError")<{
 *   readonly source: string
 * }> {}
 *
 * // Create two channels
 * const leftChannel = Channel.fromIterable([1, 2, 3])
 * const rightChannel = Channel.fromIterable(["a", "b", "c"])
 *
 * // Merge them with "either" halt strategy
 * const mergedChannel = Channel.merge(leftChannel, rightChannel, {
 *   haltStrategy: "either"
 * })
 *
 * // Outputs elements from both channels concurrently
 * // Order may vary: 1, "a", 2, "b", 3, "c"
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
const exportName = "merge";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Returns a new channel, which is the merge of this channel and the specified channel.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass MergeError extends Data.TaggedError("MergeError")<{\n  readonly source: string\n}> {}\n\n// Create two channels\nconst leftChannel = Channel.fromIterable([1, 2, 3])\nconst rightChannel = Channel.fromIterable(["a", "b", "c"])\n\n// Merge them with "either" halt strategy\nconst mergedChannel = Channel.merge(leftChannel, rightChannel, {\n  haltStrategy: "either"\n})\n\n// Outputs elements from both channels concurrently\n// Order may vary: 1, "a", 2, "b", 3, "c"';
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
