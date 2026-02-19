/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromSubscription
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.638Z
 *
 * Overview:
 * Create a channel from a PubSub subscription
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class SubscriptionError extends Data.TaggedError("SubscriptionError")<{
 *   readonly reason: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a PubSub
 *   const pubsub = yield* PubSub.bounded<string>(32)
 *
 *   // Create a subscription
 *   const subscription = yield* PubSub.subscribe(pubsub)
 *
 *   // Publish some messages
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 *   yield* PubSub.publish(pubsub, "from")
 *   yield* PubSub.publish(pubsub, "PubSub")
 *
 *   // Create a channel from the subscription
 *   const channel = Channel.fromSubscription(subscription)
 *
 *   // The channel will receive all published messages
 *   return channel
 * })
 *
 * // Real-time notifications example
 * const notificationChannel = Effect.gen(function*() {
 *   const eventBus = yield* PubSub.unbounded<{ type: string; payload: any }>()
 *   const userSubscription = yield* PubSub.subscribe(eventBus)
 *
 *   return Channel.fromSubscription(userSubscription)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromSubscription";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Create a channel from a PubSub subscription";
const sourceExample =
  'import { Channel, Data, Effect, PubSub } from "effect"\n\nclass SubscriptionError extends Data.TaggedError("SubscriptionError")<{\n  readonly reason: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a PubSub\n  const pubsub = yield* PubSub.bounded<string>(32)\n\n  // Create a subscription\n  const subscription = yield* PubSub.subscribe(pubsub)\n\n  // Publish some messages\n  yield* PubSub.publish(pubsub, "Hello")\n  yield* PubSub.publish(pubsub, "World")\n  yield* PubSub.publish(pubsub, "from")\n  yield* PubSub.publish(pubsub, "PubSub")\n\n  // Create a channel from the subscription\n  const channel = Channel.fromSubscription(subscription)\n\n  // The channel will receive all published messages\n  return channel\n})\n\n// Real-time notifications example\nconst notificationChannel = Effect.gen(function*() {\n  const eventBus = yield* PubSub.unbounded<{ type: string; payload: any }>()\n  const userSubscription = yield* PubSub.subscribe(eventBus)\n\n  return Channel.fromSubscription(userSubscription)\n})';
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
