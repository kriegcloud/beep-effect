/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: DroppingStrategy
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.990Z
 *
 * Overview:
 * A strategy that drops new messages when the `PubSub` is at capacity. This guarantees that a slow subscriber will not slow down the rate at which messages are published. However, it creates the risk that a slow subscriber will slow down the rate at which messages are received by other subscribers and that subscribers may not receive all messages published to the `PubSub` while they are subscribed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create PubSub with dropping strategy
 *   const pubsub = yield* PubSub.dropping<string>(2)
 *
 *   // Or explicitly create with dropping strategy
 *   const customPubsub = yield* PubSub.make<string>({
 *     atomicPubSub: () => PubSub.makeAtomicBounded(2),
 *     strategy: () => new PubSub.DroppingStrategy()
 *   })
 *
 *   // Fill the PubSub
 *   const pub1 = yield* PubSub.publish(pubsub, "msg1") // true
 *   const pub2 = yield* PubSub.publish(pubsub, "msg2") // true
 *   const pub3 = yield* PubSub.publish(pubsub, "msg3") // false (dropped)
 *
 *   console.log("Publication results:", [pub1, pub2, pub3]) // [true, true, false]
 *
 *   // Subscribers will only see the first two messages
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const messages = yield* PubSub.takeAll(subscription)
 *     console.log("Received messages:", messages) // ["msg1", "msg2"]
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
const exportName = "DroppingStrategy";
const exportKind = "class";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "A strategy that drops new messages when the `PubSub` is at capacity. This guarantees that a slow subscriber will not slow down the rate at which messages are published. However,...";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  // Create PubSub with dropping strategy\n  const pubsub = yield* PubSub.dropping<string>(2)\n\n  // Or explicitly create with dropping strategy\n  const customPubsub = yield* PubSub.make<string>({\n    atomicPubSub: () => PubSub.makeAtomicBounded(2),\n    strategy: () => new PubSub.DroppingStrategy()\n  })\n\n  // Fill the PubSub\n  const pub1 = yield* PubSub.publish(pubsub, "msg1") // true\n  const pub2 = yield* PubSub.publish(pubsub, "msg2") // true\n  const pub3 = yield* PubSub.publish(pubsub, "msg3") // false (dropped)\n\n  console.log("Publication results:", [pub1, pub2, pub3]) // [true, true, false]\n\n  // Subscribers will only see the first two messages\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n    const messages = yield* PubSub.takeAll(subscription)\n    console.log("Received messages:", messages) // ["msg1", "msg2"]\n  }))\n})';
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
