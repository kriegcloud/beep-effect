/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: concatWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.223Z
 *
 * Overview:
 * Concatenates this channel with another channel created from the terminal value of this channel. The new channel is created using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ConcatError extends Data.TaggedError("ConcatError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel that outputs numbers and terminates with sum
 * const numberChannel = Channel.fromIterable([1, 2, 3]).pipe(
 *   Channel.concatWith((sum: void) => Channel.succeed(`Completed processing`))
 * )
 *
 * // Concatenates additional channel based on completion value
 * // Outputs: 1, 2, 3, then "Completed processing"
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
const exportName = "concatWith";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Concatenates this channel with another channel created from the terminal value of this channel. The new channel is created using the provided function.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass ConcatError extends Data.TaggedError("ConcatError")<{\n  readonly reason: string\n}> {}\n\n// Create a channel that outputs numbers and terminates with sum\nconst numberChannel = Channel.fromIterable([1, 2, 3]).pipe(\n  Channel.concatWith((sum: void) => Channel.succeed(`Completed processing`))\n)\n\n// Concatenates additional channel based on completion value\n// Outputs: 1, 2, 3, then "Completed processing"';
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
