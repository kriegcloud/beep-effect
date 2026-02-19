/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: pipeTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.640Z
 *
 * Overview:
 * Returns a new channel that pipes the output of this channel into the specified channel. The returned channel has the input type of this channel, and the output type of the specified channel, terminating with the value of the specified channel.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class PipeError extends Data.TaggedError("PipeError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create source and transform channels
 * const sourceChannel = Channel.fromIterable([1, 2, 3])
 * const transformChannel = Channel.map(sourceChannel, (n: number) => n * 2)
 *
 * // Pipe the source into the transform
 * const pipedChannel = Channel.pipeTo(sourceChannel, transformChannel)
 *
 * // Outputs: 2, 4, 6
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
const exportName = "pipeTo";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Returns a new channel that pipes the output of this channel into the specified channel. The returned channel has the input type of this channel, and the output type of the speci...";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass PipeError extends Data.TaggedError("PipeError")<{\n  readonly stage: string\n}> {}\n\n// Create source and transform channels\nconst sourceChannel = Channel.fromIterable([1, 2, 3])\nconst transformChannel = Channel.map(sourceChannel, (n: number) => n * 2)\n\n// Pipe the source into the transform\nconst pipedChannel = Channel.pipeTo(sourceChannel, transformChannel)\n\n// Outputs: 2, 4, 6';
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
