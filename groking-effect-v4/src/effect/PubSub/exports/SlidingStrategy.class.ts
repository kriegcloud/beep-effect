/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: SlidingStrategy
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * A strategy that adds new messages and drops old messages when the `PubSub` is at capacity. This guarantees that a slow subscriber will not slow down the rate at which messages are published and received by other subscribers. However, it creates the risk that a slow subscriber will not receive some messages published to the `PubSub` while it is subscribed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create PubSub with sliding strategy
 *   const pubsub = yield* PubSub.sliding<string>(2)
 *
 *   // Or explicitly create with sliding strategy
 *   const customPubsub = yield* PubSub.make<string>({
 *     atomicPubSub: () => PubSub.makeAtomicBounded(2),
 *     strategy: () => new PubSub.SlidingStrategy()
 *   })
 *
 *   // Publish messages that exceed capacity
 *   yield* PubSub.publish(pubsub, "msg1") // stored
 *   yield* PubSub.publish(pubsub, "msg2") // stored
 *   yield* PubSub.publish(pubsub, "msg3") // "msg1" evicted, "msg3" stored
 *   yield* PubSub.publish(pubsub, "msg4") // "msg2" evicted, "msg4" stored
 *
 *   // Subscribers will see the most recent messages
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const messages = yield* PubSub.takeAll(subscription)
 *     console.log("Recent messages:", messages) // ["msg3", "msg4"]
 *   }))
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PubSubModule from "effect/PubSub";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SlidingStrategy";
const exportKind = "class";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "A strategy that adds new messages and drops old messages when the `PubSub` is at capacity. This guarantees that a slow subscriber will not slow down the rate at which messages a...";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  // Create PubSub with sliding strategy\n  const pubsub = yield* PubSub.sliding<string>(2)\n\n  // Or explicitly create with sliding strategy\n  const customPubsub = yield* PubSub.make<string>({\n    atomicPubSub: () => PubSub.makeAtomicBounded(2),\n    strategy: () => new PubSub.SlidingStrategy()\n  })\n\n  // Publish messages that exceed capacity\n  yield* PubSub.publish(pubsub, "msg1") // stored\n  yield* PubSub.publish(pubsub, "msg2") // stored\n  yield* PubSub.publish(pubsub, "msg3") // "msg1" evicted, "msg3" stored\n  yield* PubSub.publish(pubsub, "msg4") // "msg2" evicted, "msg4" stored\n\n  // Subscribers will see the most recent messages\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n    const messages = yield* PubSub.takeAll(subscription)\n    console.log("Recent messages:", messages) // ["msg3", "msg4"]\n  }))\n})';
const moduleRecord = PubSubModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
