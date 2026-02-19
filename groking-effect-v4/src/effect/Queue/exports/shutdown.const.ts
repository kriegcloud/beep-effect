/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: shutdown
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * Shutdown the queue, canceling any pending operations. If the queue is already done, `false` is returned.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(2)
 *
 *   // Add messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *
 *   // Try to add more than capacity (will be pending)
 *   const pendingOffer = Queue.offer(queue, 3)
 *
 *   // Shutdown cancels pending operations and clears the queue
 *   const wasShutdown = yield* Queue.shutdown(queue)
 *   console.log(wasShutdown) // true
 *
 *   // Queue is now done and cleared
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 0
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
const exportName = "shutdown";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary =
  "Shutdown the queue, canceling any pending operations. If the queue is already done, `false` is returned.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(2)\n\n  // Add messages\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n\n  // Try to add more than capacity (will be pending)\n  const pendingOffer = Queue.offer(queue, 3)\n\n  // Shutdown cancels pending operations and clears the queue\n  const wasShutdown = yield* Queue.shutdown(queue)\n  console.log(wasShutdown) // true\n\n  // Queue is now done and cleared\n  const size = yield* Queue.size(queue)\n  console.log(size) // 0\n})';
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
