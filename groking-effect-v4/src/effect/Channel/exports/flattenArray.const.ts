/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: flattenArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.224Z
 *
 * Overview:
 * Flattens a channel that outputs arrays into a channel that outputs individual elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class FlattenError extends Data.TaggedError("FlattenError")<{
 *   readonly message: string
 * }> {}
 *
 * // Create a channel that outputs arrays
 * const arrayChannel = Channel.fromIterable([
 *   [1, 2, 3],
 *   [4, 5],
 *   [6, 7, 8, 9]
 * ])
 *
 * // Flatten the arrays into individual elements
 * const flattenedChannel = Channel.flattenArray(arrayChannel)
 *
 * // Outputs: 1, 2, 3, 4, 5, 6, 7, 8, 9
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
const exportName = "flattenArray";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Flattens a channel that outputs arrays into a channel that outputs individual elements.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass FlattenError extends Data.TaggedError("FlattenError")<{\n  readonly message: string\n}> {}\n\n// Create a channel that outputs arrays\nconst arrayChannel = Channel.fromIterable([\n  [1, 2, 3],\n  [4, 5],\n  [6, 7, 8, 9]\n])\n\n// Flatten the arrays into individual elements\nconst flattenedChannel = Channel.flattenArray(arrayChannel)\n\n// Outputs: 1, 2, 3, 4, 5, 6, 7, 8, 9';
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
