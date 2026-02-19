/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: takeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.324Z
 *
 * Overview:
 * Takes all items from the queue. Blocks if the queue is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number, string>(10)
 *   yield* TxQueue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   // Take all items atomically - returns NonEmptyArray
 *   const items = yield* TxQueue.takeAll(queue)
 *   console.log(items) // [1, 2, 3, 4, 5]
 *   console.log(Array.isArrayNonEmpty(items)) // true
 * })
 *
 * // Error propagation example
 * const errorExample = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number, string>(5)
 *   yield* TxQueue.offerAll(queue, [1, 2])
 *   yield* TxQueue.fail(queue, "processing error")
 *
 *   // takeAll() propagates the queue error through E-channel
 *   const result = yield* Effect.flip(TxQueue.takeAll(queue))
 *   console.log(result) // "processing error"
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
const exportName = "takeAll";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Takes all items from the queue. Blocks if the queue is empty.";
const sourceExample =
  'import { Array, Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number, string>(10)\n  yield* TxQueue.offerAll(queue, [1, 2, 3, 4, 5])\n\n  // Take all items atomically - returns NonEmptyArray\n  const items = yield* TxQueue.takeAll(queue)\n  console.log(items) // [1, 2, 3, 4, 5]\n  console.log(Array.isArrayNonEmpty(items)) // true\n})\n\n// Error propagation example\nconst errorExample = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number, string>(5)\n  yield* TxQueue.offerAll(queue, [1, 2])\n  yield* TxQueue.fail(queue, "processing error")\n\n  // takeAll() propagates the queue error through E-channel\n  const result = yield* Effect.flip(TxQueue.takeAll(queue))\n  console.log(result) // "processing error"\n})';
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
