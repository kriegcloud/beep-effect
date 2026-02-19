/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromPubSubArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.638Z
 *
 * Overview:
 * Create a channel from a PubSub that outputs arrays of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 * 
 * class BatchError extends Data.TaggedError("BatchError")<{
 *   readonly message: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<number>(16)
 * 
 *   // Create a channel that reads arrays of values
 *   const channel = Channel.fromPubSubArray(pubsub)
 * 
 *   // Publish some values
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *   yield* PubSub.publish(pubsub, 3)
 *   yield* PubSub.publish(pubsub, 4)
 * 
 *   // The channel will output arrays like [1, 2, 3] and [4]
 *   return channel
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromPubSubArray";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Create a channel from a PubSub that outputs arrays of values.";
const sourceExample = "import { Channel, Data, Effect, PubSub } from \"effect\"\n\nclass BatchError extends Data.TaggedError(\"BatchError\")<{\n  readonly message: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<number>(16)\n\n  // Create a channel that reads arrays of values\n  const channel = Channel.fromPubSubArray(pubsub)\n\n  // Publish some values\n  yield* PubSub.publish(pubsub, 1)\n  yield* PubSub.publish(pubsub, 2)\n  yield* PubSub.publish(pubsub, 3)\n  yield* PubSub.publish(pubsub, 4)\n\n  // The channel will output arrays like [1, 2, 3] and [4]\n  return channel\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
