/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: into
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.493Z
 *
 * Overview:
 * Run an `Effect` into a `Queue`, where success ends the queue and failure fails the queue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Create an effect that succeeds
 *   const dataProcessing = Effect.gen(function*() {
 *     yield* Effect.sleep("100 millis")
 *     return "Processing completed successfully"
 *   })
 *
 *   // Pipe the effect into the queue
 *   // If dataProcessing succeeds, queue ends successfully
 *   // If dataProcessing fails, queue fails with the error
 *   const effectIntoQueue = Queue.into(queue)(dataProcessing)
 *
 *   const wasCompleted = yield* effectIntoQueue
 *   console.log("Queue operation completed:", wasCompleted) // true
 *
 *   // Queue state now reflects the effect's outcome
 *   console.log("Queue state:", queue.state._tag) // "Done"
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
const exportName = "into";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Run an `Effect` into a `Queue`, where success ends the queue and failure fails the queue.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(10)\n\n  // Create an effect that succeeds\n  const dataProcessing = Effect.gen(function*() {\n    yield* Effect.sleep("100 millis")\n    return "Processing completed successfully"\n  })\n\n  // Pipe the effect into the queue\n  // If dataProcessing succeeds, queue ends successfully\n  // If dataProcessing fails, queue fails with the error\n  const effectIntoQueue = Queue.into(queue)(dataProcessing)\n\n  const wasCompleted = yield* effectIntoQueue\n  console.log("Queue operation completed:", wasCompleted) // true\n\n  // Queue state now reflects the effect\'s outcome\n  console.log("Queue state:", queue.state._tag) // "Done"\n})';
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
