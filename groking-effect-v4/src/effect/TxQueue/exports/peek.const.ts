/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: peek
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.324Z
 *
 * Overview:
 * Views the next item without removing it. If the queue is in a failed state, the error is propagated through the E-channel.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number, string>(10)
 *   yield* TxQueue.offer(queue, 42)
 *
 *   // Peek at the next item without removing it
 *   const item = yield* TxQueue.peek(queue)
 *   console.log(item) // 42
 *
 *   // Item is still in the queue
 *   const size = yield* TxQueue.size(queue)
 *   console.log(size) // 1
 * })
 *
 * // Error handling example
 * const errorExample = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number, string>(5)
 *   yield* TxQueue.fail(queue, "queue failed")
 *
 *   // peek() propagates the queue error through E-channel
 *   const result = yield* Effect.flip(TxQueue.peek(queue))
 *   console.log(result) // "queue failed"
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
import * as TxQueueModule from "effect/TxQueue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "peek";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary =
  "Views the next item without removing it. If the queue is in a failed state, the error is propagated through the E-channel.";
const sourceExample =
  'import { Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number, string>(10)\n  yield* TxQueue.offer(queue, 42)\n\n  // Peek at the next item without removing it\n  const item = yield* TxQueue.peek(queue)\n  console.log(item) // 42\n\n  // Item is still in the queue\n  const size = yield* TxQueue.size(queue)\n  console.log(size) // 1\n})\n\n// Error handling example\nconst errorExample = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number, string>(5)\n  yield* TxQueue.fail(queue, "queue failed")\n\n  // peek() propagates the queue error through E-channel\n  const result = yield* Effect.flip(TxQueue.peek(queue))\n  console.log(result) // "queue failed"\n})';
const moduleRecord = TxQueueModule as Record<string, unknown>;

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
