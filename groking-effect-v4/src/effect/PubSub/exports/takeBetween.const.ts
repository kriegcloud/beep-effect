/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: takeBetween
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.432Z
 *
 * Overview:
 * Takes between the specified minimum and maximum number of messages from the subscription. Will suspend if the minimum number is not immediately available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Start taking between 2 and 5 messages (will suspend)
 *     const takeFiber = yield* Effect.forkChild(
 *       PubSub.takeBetween(subscription, 2, 5)
 *     )
 *
 *     // Publish 3 messages
 *     yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
 *
 *     // Now the take will complete with 3 messages
 *     const messages = yield* Fiber.join(takeFiber)
 *     console.log("Between 2-5:", messages) // ["msg1", "msg2", "msg3"]
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
const exportName = "takeBetween";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Takes between the specified minimum and maximum number of messages from the subscription. Will suspend if the minimum number is not immediately available.";
const sourceExample =
  'import { Effect, Fiber, PubSub } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n\n    // Start taking between 2 and 5 messages (will suspend)\n    const takeFiber = yield* Effect.forkChild(\n      PubSub.takeBetween(subscription, 2, 5)\n    )\n\n    // Publish 3 messages\n    yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])\n\n    // Now the take will complete with 3 messages\n    const messages = yield* Fiber.join(takeFiber)\n    console.log("Between 2-5:", messages) // ["msg1", "msg2", "msg3"]\n  }))\n})';
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
