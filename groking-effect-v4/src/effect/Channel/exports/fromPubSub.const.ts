/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromPubSub
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.225Z
 *
 * Overview:
 * Create a channel from a PubSub that outputs individual values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class StreamError extends Data.TaggedError("StreamError")<{
 *   readonly message: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<number>(16)
 *
 *   // Create a channel that reads individual values
 *   const channel = Channel.fromPubSub(pubsub)
 *
 *   // Publish some values
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *   yield* PubSub.publish(pubsub, 3)
 *
 *   // The channel will output: 1, 2, 3 (individual values)
 *   return channel
 * })
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
const exportName = "fromPubSub";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Create a channel from a PubSub that outputs individual values.";
const sourceExample =
  'import { Channel, Data, Effect, PubSub } from "effect"\n\nclass StreamError extends Data.TaggedError("StreamError")<{\n  readonly message: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<number>(16)\n\n  // Create a channel that reads individual values\n  const channel = Channel.fromPubSub(pubsub)\n\n  // Publish some values\n  yield* PubSub.publish(pubsub, 1)\n  yield* PubSub.publish(pubsub, 2)\n  yield* PubSub.publish(pubsub, 3)\n\n  // The channel will output: 1, 2, 3 (individual values)\n  return channel\n})';
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
