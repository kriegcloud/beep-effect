/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: dropping
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.430Z
 *
 * Overview:
 * Creates a bounded `PubSub` with the dropping strategy. The `PubSub` will drop new messages if the `PubSub` is at capacity.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create dropping PubSub that drops new messages when full
 *   const pubsub = yield* PubSub.dropping<string>(3)
 *
 *   // With replay buffer for late subscribers
 *   const pubsubWithReplay = yield* PubSub.dropping<string>({
 *     capacity: 3,
 *     replay: 5
 *   })
 *
 *   // Fill the PubSub and see dropping behavior
 *   yield* PubSub.publish(pubsub, "msg1") // succeeds
 *   yield* PubSub.publish(pubsub, "msg2") // succeeds
 *   yield* PubSub.publish(pubsub, "msg3") // succeeds
 *   const dropped = yield* PubSub.publish(pubsub, "msg4") // returns false (dropped)
 *   console.log("Message dropped:", !dropped)
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
const exportName = "dropping";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Creates a bounded `PubSub` with the dropping strategy. The `PubSub` will drop new messages if the `PubSub` is at capacity.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  // Create dropping PubSub that drops new messages when full\n  const pubsub = yield* PubSub.dropping<string>(3)\n\n  // With replay buffer for late subscribers\n  const pubsubWithReplay = yield* PubSub.dropping<string>({\n    capacity: 3,\n    replay: 5\n  })\n\n  // Fill the PubSub and see dropping behavior\n  yield* PubSub.publish(pubsub, "msg1") // succeeds\n  yield* PubSub.publish(pubsub, "msg2") // succeeds\n  yield* PubSub.publish(pubsub, "msg3") // succeeds\n  const dropped = yield* PubSub.publish(pubsub, "msg4") // returns false (dropped)\n  console.log("Message dropped:", !dropped)\n})';
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
