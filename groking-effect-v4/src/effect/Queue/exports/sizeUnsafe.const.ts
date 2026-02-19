/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: sizeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * Check the size of the queue synchronously.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Check size of empty queue
 *   const size1 = Queue.sizeUnsafe(queue)
 *   console.log(size1) // 0
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *   Queue.offerUnsafe(queue, 2)
 *   Queue.offerUnsafe(queue, 3)
 *
 *   // Check size after adding messages
 *   const size2 = Queue.sizeUnsafe(queue)
 *   console.log(size2) // 3
 *
 *   // End the queue
 *   Queue.endUnsafe(queue)
 *
 *   // Size of ended queue is 0
 *   const size3 = Queue.sizeUnsafe(queue)
 *   console.log(size3) // 0
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
const exportName = "sizeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Check the size of the queue synchronously.";
const sourceExample =
  'import { Cause, Effect, Option, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(10)\n\n  // Check size of empty queue\n  const size1 = Queue.sizeUnsafe(queue)\n  console.log(size1) // 0\n\n  // Add some messages\n  Queue.offerUnsafe(queue, 1)\n  Queue.offerUnsafe(queue, 2)\n  Queue.offerUnsafe(queue, 3)\n\n  // Check size after adding messages\n  const size2 = Queue.sizeUnsafe(queue)\n  console.log(size2) // 3\n\n  // End the queue\n  Queue.endUnsafe(queue)\n\n  // Size of ended queue is 0\n  const size3 = Queue.sizeUnsafe(queue)\n  console.log(size3) // 0\n})';
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
