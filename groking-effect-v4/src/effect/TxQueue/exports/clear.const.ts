/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:50:44.330Z
 *
 * Overview:
 * Clears all elements from the queue without affecting its state. Returns the cleared elements, or an empty array if the queue is done with Done or interrupt.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number>(10)
 *   yield* TxQueue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   const sizeBefore = yield* TxQueue.size(queue)
 *   console.log(sizeBefore) // 5
 *
 *   const cleared = yield* TxQueue.clear(queue)
 *   console.log(cleared) // [1, 2, 3, 4, 5]
 *
 *   const sizeAfter = yield* TxQueue.size(queue)
 *   console.log(sizeAfter) // 0
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
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary =
  "Clears all elements from the queue without affecting its state. Returns the cleared elements, or an empty array if the queue is done with Done or interrupt.";
const sourceExample =
  'import { Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number>(10)\n  yield* TxQueue.offerAll(queue, [1, 2, 3, 4, 5])\n\n  const sizeBefore = yield* TxQueue.size(queue)\n  console.log(sizeBefore) // 5\n\n  const cleared = yield* TxQueue.clear(queue)\n  console.log(cleared) // [1, 2, 3, 4, 5]\n\n  const sizeAfter = yield* TxQueue.size(queue)\n  console.log(sizeAfter) // 0\n})';
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
