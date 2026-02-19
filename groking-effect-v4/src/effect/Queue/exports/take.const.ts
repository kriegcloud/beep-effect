/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * Take a single message from the queue, or wait for a message to be available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<string, Cause.Done>(3)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, "first")
 *   yield* Queue.offer(queue, "second")
 *
 *   // Take messages one by one
 *   const msg1 = yield* Queue.take(queue)
 *   const msg2 = yield* Queue.take(queue)
 *   console.log(msg1, msg2) // "first", "second"
 *
 *   // End the queue
 *   yield* Queue.end(queue)
 *
 *   // Taking from ended queue fails with None
 *   const result = yield* Effect.match(Queue.take(queue), {
 *     onFailure: (error: Cause.Done) => true,
 *     onSuccess: (value: string) => false
 *   })
 *   console.log("Queue ended:", result) // true
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
import * as QueueModule from "effect/Queue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Take a single message from the queue, or wait for a message to be available.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<string, Cause.Done>(3)\n\n  // Add some messages\n  yield* Queue.offer(queue, "first")\n  yield* Queue.offer(queue, "second")\n\n  // Take messages one by one\n  const msg1 = yield* Queue.take(queue)\n  const msg2 = yield* Queue.take(queue)\n  console.log(msg1, msg2) // "first", "second"\n\n  // End the queue\n  yield* Queue.end(queue)\n\n  // Taking from ended queue fails with None\n  const result = yield* Effect.match(Queue.take(queue), {\n    onFailure: (error: Cause.Done) => true,\n    onSuccess: (value: string) => false\n  })\n  console.log("Queue ended:", result) // true\n})';
const moduleRecord = QueueModule as Record<string, unknown>;

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
