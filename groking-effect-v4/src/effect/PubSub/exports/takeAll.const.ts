/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: takeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.992Z
 *
 * Overview:
 * Takes all available messages from the subscription, suspending if no items are available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish multiple messages
 *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Take all available messages at once
 *     const allMessages = yield* PubSub.takeAll(subscription)
 *     console.log("All messages:", allMessages) // ["msg1", "msg2", "msg3"]
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PubSubModule from "effect/PubSub";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "takeAll";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Takes all available messages from the subscription, suspending if no items are available.";
const sourceExample =
  'import { Effect, PubSub } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Publish multiple messages\n  yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n\n    // Take all available messages at once\n    const allMessages = yield* PubSub.takeAll(subscription)\n    console.log("All messages:", allMessages) // ["msg1", "msg2", "msg3"]\n  }))\n})';
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
