/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: shutdown
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.431Z
 *
 * Overview:
 * Interrupts any fibers that are suspended on `offer` or `take`. Future calls to `offer*` and `take*` will be interrupted immediately.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(1)
 *
 *   // Start a fiber that will be suspended waiting to publish
 *   const publisherFiber = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* PubSub.publish(pubsub, "msg1") // fills the buffer
 *       yield* PubSub.publish(pubsub, "msg2") // will suspend here
 *     })
 *   )
 *
 *   // Shutdown the PubSub
 *   yield* PubSub.shutdown(pubsub)
 *
 *   // The suspended publisher will be interrupted
 *   const result = yield* Fiber.await(publisherFiber)
 *   console.log("Publisher interrupted:", result._tag === "Failure")
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
const exportName = "shutdown";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Interrupts any fibers that are suspended on `offer` or `take`. Future calls to `offer*` and `take*` will be interrupted immediately.";
const sourceExample =
  'import { Effect, Fiber, PubSub } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(1)\n\n  // Start a fiber that will be suspended waiting to publish\n  const publisherFiber = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* PubSub.publish(pubsub, "msg1") // fills the buffer\n      yield* PubSub.publish(pubsub, "msg2") // will suspend here\n    })\n  )\n\n  // Shutdown the PubSub\n  yield* PubSub.shutdown(pubsub)\n\n  // The suspended publisher will be interrupted\n  const result = yield* Fiber.await(publisherFiber)\n  console.log("Publisher interrupted:", result._tag === "Failure")\n})';
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
