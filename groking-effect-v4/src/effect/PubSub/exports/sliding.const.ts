/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: sliding
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.431Z
 *
 * Overview:
 * Creates a bounded `PubSub` with the sliding strategy. The `PubSub` will add new messages and drop old messages if the `PubSub` is at capacity.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create sliding PubSub that evicts old messages when full
 *   const pubsub = yield* PubSub.sliding<string>(3)
 *
 *   // With replay buffer
 *   const pubsubWithReplay = yield* PubSub.sliding<string>({
 *     capacity: 3,
 *     replay: 2
 *   })
 *
 *   // Fill and overflow the PubSub
 *   yield* PubSub.publish(pubsub, "msg1")
 *   yield* PubSub.publish(pubsub, "msg2")
 *   yield* PubSub.publish(pubsub, "msg3")
 *   yield* PubSub.publish(pubsub, "msg4") // "msg1" is evicted
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const messages = yield* PubSub.takeAll(subscription)
 *     console.log(messages) // ["msg2", "msg3", "msg4"]
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
const exportName = "sliding";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Creates a bounded `PubSub` with the sliding strategy. The `PubSub` will add new messages and drop old messages if the `PubSub` is at capacity.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  // Create sliding PubSub that evicts old messages when full\n  const pubsub = yield* PubSub.sliding<string>(3)\n\n  // With replay buffer\n  const pubsubWithReplay = yield* PubSub.sliding<string>({\n    capacity: 3,\n    replay: 2\n  })\n\n  // Fill and overflow the PubSub\n  yield* PubSub.publish(pubsub, "msg1")\n  yield* PubSub.publish(pubsub, "msg2")\n  yield* PubSub.publish(pubsub, "msg3")\n  yield* PubSub.publish(pubsub, "msg4") // "msg1" is evicted\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n    const messages = yield* PubSub.takeAll(subscription)\n    console.log(messages) // ["msg2", "msg3", "msg4"]\n  }))\n})';
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
