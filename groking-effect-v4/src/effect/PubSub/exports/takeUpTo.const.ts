/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: takeUpTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.432Z
 *
 * Overview:
 * Takes up to the specified number of messages from the subscription without suspending.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish multiple messages
 *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3", "msg4", "msg5"])
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Take up to 3 messages
 *     const upTo3 = yield* PubSub.takeUpTo(subscription, 3)
 *     console.log("Up to 3:", upTo3) // ["msg1", "msg2", "msg3"]
 *
 *     // Take up to 5 more (only 2 remaining)
 *     const upTo5 = yield* PubSub.takeUpTo(subscription, 5)
 *     console.log("Up to 5:", upTo5) // ["msg4", "msg5"]
 *
 *     // No more messages available
 *     const noMore = yield* PubSub.takeUpTo(subscription, 10)
 *     console.log("No more:", noMore) // []
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
const exportName = "takeUpTo";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Takes up to the specified number of messages from the subscription without suspending.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Publish multiple messages\n  yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3", "msg4", "msg5"])\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n\n    // Take up to 3 messages\n    const upTo3 = yield* PubSub.takeUpTo(subscription, 3)\n    console.log("Up to 3:", upTo3) // ["msg1", "msg2", "msg3"]\n\n    // Take up to 5 more (only 2 remaining)\n    const upTo5 = yield* PubSub.takeUpTo(subscription, 5)\n    console.log("Up to 5:", upTo5) // ["msg4", "msg5"]\n\n    // No more messages available\n    const noMore = yield* PubSub.takeUpTo(subscription, 10)\n    console.log("No more:", noMore) // []\n  }))\n})';
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
