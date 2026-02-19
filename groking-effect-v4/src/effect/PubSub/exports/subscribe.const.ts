/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: subscribe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.432Z
 *
 * Overview:
 * Subscribes to receive messages from the `PubSub`. The resulting subscription can be evaluated multiple times within the scope to take a message from the `PubSub` each time.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish some messages
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 *
 *   // Subscribe within a scope for automatic cleanup
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Take messages one by one
 *     const msg1 = yield* PubSub.take(subscription)
 *     const msg2 = yield* PubSub.take(subscription)
 *     console.log(msg1, msg2) // "Hello", "World"
 *
 *     // Subscription is automatically cleaned up when scope exits
 *   }))
 *
 *   // Multiple subscribers can receive the same messages
 *   yield* PubSub.publish(pubsub, "Broadcast")
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const sub1 = yield* PubSub.subscribe(pubsub)
 *     const sub2 = yield* PubSub.subscribe(pubsub)
 *
 *     const [msg1, msg2] = yield* Effect.all([
 *       PubSub.take(sub1),
 *       PubSub.take(sub2)
 *     ])
 *     console.log("Both received:", msg1, msg2) // "Broadcast", "Broadcast"
 *   }))
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PubSubModule from "effect/PubSub";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "subscribe";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Subscribes to receive messages from the `PubSub`. The resulting subscription can be evaluated multiple times within the scope to take a message from the `PubSub` each time.";
const sourceExample =
  'import { Effect, PubSub } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Publish some messages\n  yield* PubSub.publish(pubsub, "Hello")\n  yield* PubSub.publish(pubsub, "World")\n\n  // Subscribe within a scope for automatic cleanup\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n\n    // Take messages one by one\n    const msg1 = yield* PubSub.take(subscription)\n    const msg2 = yield* PubSub.take(subscription)\n    console.log(msg1, msg2) // "Hello", "World"\n\n    // Subscription is automatically cleaned up when scope exits\n  }))\n\n  // Multiple subscribers can receive the same messages\n  yield* PubSub.publish(pubsub, "Broadcast")\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const sub1 = yield* PubSub.subscribe(pubsub)\n    const sub2 = yield* PubSub.subscribe(pubsub)\n\n    const [msg1, msg2] = yield* Effect.all([\n      PubSub.take(sub1),\n      PubSub.take(sub2)\n    ])\n    console.log("Both received:", msg1, msg2) // "Broadcast", "Broadcast"\n  }))\n})';
const moduleRecord = PubSubModule as Record<string, unknown>;

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
