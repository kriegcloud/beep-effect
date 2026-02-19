/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: concat
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.636Z
 *
 * Overview:
 * Concatenates this channel with another channel, so that the second channel starts emitting values after the first channel has completed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ConcatError extends Data.TaggedError("ConcatError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create two channels
 * const firstChannel = Channel.fromIterable([1, 2, 3])
 * const secondChannel = Channel.fromIterable(["a", "b", "c"])
 *
 * // Concatenate them
 * const concatenatedChannel = Channel.concat(firstChannel, secondChannel)
 *
 * // Outputs: 1, 2, 3, "a", "b", "c"
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
const exportName = "concat";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Concatenates this channel with another channel, so that the second channel starts emitting values after the first channel has completed.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass ConcatError extends Data.TaggedError("ConcatError")<{\n  readonly reason: string\n}> {}\n\n// Create two channels\nconst firstChannel = Channel.fromIterable([1, 2, 3])\nconst secondChannel = Channel.fromIterable(["a", "b", "c"])\n\n// Concatenate them\nconst concatenatedChannel = Channel.concat(firstChannel, secondChannel)\n\n// Outputs: 1, 2, 3, "a", "b", "c"';
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
