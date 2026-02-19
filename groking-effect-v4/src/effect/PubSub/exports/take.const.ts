/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.432Z
 *
 * Overview:
 * Takes a single message from the subscription. If no messages are available, this will suspend until a message becomes available.
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
 *     // Start a fiber to take a message (will suspend)
 *     const takeFiber = yield* Effect.forkChild(
 *       PubSub.take(subscription)
 *     )
 *
 *     // Publish a message
 *     yield* PubSub.publish(pubsub, "Hello")
 *
 *     // The take will now complete
 *     const message = yield* Fiber.join(takeFiber)
 *     console.log("Received:", message) // "Hello"
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
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Takes a single message from the subscription. If no messages are available, this will suspend until a message becomes available.";
const sourceExample =
  'import { Effect, Fiber, PubSub } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n\n    // Start a fiber to take a message (will suspend)\n    const takeFiber = yield* Effect.forkChild(\n      PubSub.take(subscription)\n    )\n\n    // Publish a message\n    yield* PubSub.publish(pubsub, "Hello")\n\n    // The take will now complete\n    const message = yield* Fiber.join(takeFiber)\n    console.log("Received:", message) // "Hello"\n  }))\n})';
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
