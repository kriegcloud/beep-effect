/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: awaitShutdown
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.990Z
 *
 * Overview:
 * Waits until the queue is shutdown. The `Effect` returned by this method will not resume until the queue has been shutdown. If the queue is already shutdown, the `Effect` will resume right away.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Start a fiber that waits for shutdown
 *   const waiterFiber = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* PubSub.awaitShutdown(pubsub)
 *       console.log("PubSub has been shutdown!")
 *     })
 *   )
 *
 *   // Do some work...
 *   yield* Effect.sleep("100 millis")
 *
 *   // Shutdown the PubSub
 *   yield* PubSub.shutdown(pubsub)
 *
 *   // The waiter will now complete
 *   yield* Fiber.join(waiterFiber)
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
const exportName = "awaitShutdown";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Waits until the queue is shutdown. The `Effect` returned by this method will not resume until the queue has been shutdown. If the queue is already shutdown, the `Effect` will re...";
const sourceExample =
  'import { Effect, Fiber, PubSub } from "effect"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Start a fiber that waits for shutdown\n  const waiterFiber = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* PubSub.awaitShutdown(pubsub)\n      console.log("PubSub has been shutdown!")\n    })\n  )\n\n  // Do some work...\n  yield* Effect.sleep("100 millis")\n\n  // Shutdown the PubSub\n  yield* PubSub.shutdown(pubsub)\n\n  // The waiter will now complete\n  yield* Fiber.join(waiterFiber)\n})';
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
