/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: endUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.493Z
 *
 * Overview:
 * Signal that the queue is complete synchronously. If the queue is already done, `false` is returned.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * // Create a queue and use unsafe operations
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *   Queue.offerUnsafe(queue, 2)
 *
 *   // End the queue synchronously
 *   const ended = Queue.endUnsafe(queue)
 *   console.log(ended) // true
 *
 *   // The queue is now done
 *   console.log(queue.state._tag) // "Done"
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
const exportName = "endUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary =
  "Signal that the queue is complete synchronously. If the queue is already done, `false` is returned.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\n// Create a queue and use unsafe operations\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(10)\n\n  // Add some messages\n  Queue.offerUnsafe(queue, 1)\n  Queue.offerUnsafe(queue, 2)\n\n  // End the queue synchronously\n  const ended = Queue.endUnsafe(queue)\n  console.log(ended) // true\n\n  // The queue is now done\n  console.log(queue.state._tag) // "Done"\n})';
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
