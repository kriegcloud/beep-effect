/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.492Z
 *
 * Overview:
 * Take all messages from the queue, returning an empty array if the queue is empty or done.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   // Clear all messages from the queue
 *   const messages = yield* Queue.clear(queue)
 *   console.log(messages) // [1, 2, 3, 4, 5]
 *
 *   // Queue is now empty
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 0
 *
 *   // Clearing empty queue returns empty array
 *   const empty = yield* Queue.clear(queue)
 *   console.log(empty) // []
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
import * as QueueModule from "effect/Queue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Take all messages from the queue, returning an empty array if the queue is empty or done.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(10)\n\n  // Add several messages\n  yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])\n\n  // Clear all messages from the queue\n  const messages = yield* Queue.clear(queue)\n  console.log(messages) // [1, 2, 3, 4, 5]\n\n  // Queue is now empty\n  const size = yield* Queue.size(queue)\n  console.log(size) // 0\n\n  // Clearing empty queue returns empty array\n  const empty = yield* Queue.clear(queue)\n  console.log(empty) // []\n})';
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
