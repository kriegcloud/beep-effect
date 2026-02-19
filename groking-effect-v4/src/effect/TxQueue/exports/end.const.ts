/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: end
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:50:44.330Z
 *
 * Overview:
 * Ends a queue by signaling completion with a Done error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number, Cause.Done>(10)
 *   yield* TxQueue.offer(queue, 1)
 *   yield* TxQueue.offer(queue, 2)
 *
 *   // Signal the end of the queue
 *   const result = yield* TxQueue.end(queue)
 *   console.log(result) // true
 *
 *   // All operations will now fail with Done
 *   const takeResult = yield* Effect.flip(TxQueue.take(queue))
 *   console.log(Cause.isDone(takeResult)) // true
 *
 *   const peekResult = yield* Effect.flip(TxQueue.peek(queue))
 *   console.log(Cause.isDone(peekResult)) // true
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
import * as TxQueueModule from "effect/TxQueue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "end";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Ends a queue by signaling completion with a Done error.";
const sourceExample =
  'import { Cause, Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number, Cause.Done>(10)\n  yield* TxQueue.offer(queue, 1)\n  yield* TxQueue.offer(queue, 2)\n\n  // Signal the end of the queue\n  const result = yield* TxQueue.end(queue)\n  console.log(result) // true\n\n  // All operations will now fail with Done\n  const takeResult = yield* Effect.flip(TxQueue.take(queue))\n  console.log(Cause.isDone(takeResult)) // true\n\n  const peekResult = yield* Effect.flip(TxQueue.peek(queue))\n  console.log(Cause.isDone(peekResult)) // true\n})';
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
