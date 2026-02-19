/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: dropping
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:50:44.330Z
 *
 * Overview:
 * Creates a new dropping `TxQueue` with the specified capacity that drops new items when full.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a dropping queue with capacity 2
 *   const queue = yield* TxQueue.dropping<number>(2)
 *
 *   // Fill to capacity
 *   yield* TxQueue.offer(queue, 1)
 *   yield* TxQueue.offer(queue, 2)
 *
 *   // This will be dropped (returns false)
 *   const accepted = yield* TxQueue.offer(queue, 3)
 *   console.log(accepted) // false
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
const exportName = "dropping";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Creates a new dropping `TxQueue` with the specified capacity that drops new items when full.";
const sourceExample =
  'import { Effect, TxQueue } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a dropping queue with capacity 2\n  const queue = yield* TxQueue.dropping<number>(2)\n\n  // Fill to capacity\n  yield* TxQueue.offer(queue, 1)\n  yield* TxQueue.offer(queue, 2)\n\n  // This will be dropped (returns false)\n  const accepted = yield* TxQueue.offer(queue, 3)\n  console.log(accepted) // false\n})';
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
