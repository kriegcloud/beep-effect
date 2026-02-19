/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: unwrap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.230Z
 *
 * Overview:
 * Constructs a `Channel` from a scoped effect that will result in a `Channel` if successful.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class UnwrapError extends Data.TaggedError("UnwrapError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create an effect that produces a channel
 * const channelEffect = Effect.succeed(
 *   Channel.fromIterable([1, 2, 3])
 * )
 *
 * // Unwrap the effect to get the channel
 * const unwrappedChannel = Channel.unwrap(channelEffect)
 *
 * // The resulting channel outputs: 1, 2, 3
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
const exportName = "unwrap";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Constructs a `Channel` from a scoped effect that will result in a `Channel` if successful.";
const sourceExample =
  'import { Channel, Data, Effect } from "effect"\n\nclass UnwrapError extends Data.TaggedError("UnwrapError")<{\n  readonly reason: string\n}> {}\n\n// Create an effect that produces a channel\nconst channelEffect = Effect.succeed(\n  Channel.fromIterable([1, 2, 3])\n)\n\n// Unwrap the effect to get the channel\nconst unwrappedChannel = Channel.unwrap(channelEffect)\n\n// The resulting channel outputs: 1, 2, 3';
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
