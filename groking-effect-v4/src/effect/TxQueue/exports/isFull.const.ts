/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: isFull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.323Z
 *
 * Overview:
 * Checks if the queue is at capacity.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number>(2)
 *
 *   const full = yield* TxQueue.isFull(queue)
 *   console.log(full) // false
 *
 *   yield* TxQueue.offerAll(queue, [1, 2])
 *   const nowFull = yield* TxQueue.isFull(queue)
 *   console.log(nowFull) // true
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
const exportName = "isFull";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Checks if the queue is at capacity.";
const sourceExample =
  'import { Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number>(2)\n\n  const full = yield* TxQueue.isFull(queue)\n  console.log(full) // false\n\n  yield* TxQueue.offerAll(queue, [1, 2])\n  const nowFull = yield* TxQueue.isFull(queue)\n  console.log(nowFull) // true\n})';
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
