/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: switchMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.229Z
 *
 * Overview:
 * Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this channel. The result is a channel that will first perform the functions of this channel, before performing the functions of the created channel (including yielding its terminal value).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class SwitchError extends Data.TaggedError("SwitchError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel that outputs numbers
 * const numberChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Switch to new channels based on each value
 * const switchedChannel = Channel.switchMap(
 *   numberChannel,
 *   (n) => Channel.fromIterable([`value-${n}`])
 * )
 *
 * // Outputs: "value-1", "value-2", "value-3"
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
const exportName = "switchMap";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this c...";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass SwitchError extends Data.TaggedError("SwitchError")<{\n  readonly reason: string\n}> {}\n\n// Create a channel that outputs numbers\nconst numberChannel = Channel.fromIterable([1, 2, 3])\n\n// Switch to new channels based on each value\nconst switchedChannel = Channel.switchMap(\n  numberChannel,\n  (n) => Channel.fromIterable([`value-${n}`])\n)\n\n// Outputs: "value-1", "value-2", "value-3"';
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
