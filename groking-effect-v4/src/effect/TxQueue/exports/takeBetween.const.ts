/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: takeBetween
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.324Z
 *
 * Overview:
 * Takes a variable number of items between a specified minimum and maximum from the queue. Waits for at least the minimum number of items to be available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxQueue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* TxQueue.bounded<number>(10)
 *   yield* TxQueue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8])
 * 
 *   // Take between 2 and 5 items
 *   const batch1 = yield* TxQueue.takeBetween(queue, 2, 5)
 *   console.log(batch1) // [1, 2, 3, 4, 5] - took 5 (up to max)
 * 
 *   // Take between 1 and 10 items (but only 3 remain)
 *   const batch2 = yield* TxQueue.takeBetween(queue, 1, 10)
 *   console.log(batch2) // [6, 7, 8] - took 3 (all remaining)
 * 
 *   // Would wait for at least 1 item to be available
 *   // const batch3 = yield* TxQueue.takeBetween(queue, 1, 3)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxQueueModule from "effect/TxQueue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "takeBetween";
const exportKind = "const";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Takes a variable number of items between a specified minimum and maximum from the queue. Waits for at least the minimum number of items to be available.";
const sourceExample = "import { Effect, TxQueue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* TxQueue.bounded<number>(10)\n  yield* TxQueue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8])\n\n  // Take between 2 and 5 items\n  const batch1 = yield* TxQueue.takeBetween(queue, 2, 5)\n  console.log(batch1) // [1, 2, 3, 4, 5] - took 5 (up to max)\n\n  // Take between 1 and 10 items (but only 3 remain)\n  const batch2 = yield* TxQueue.takeBetween(queue, 1, 10)\n  console.log(batch2) // [6, 7, 8] - took 3 (all remaining)\n\n  // Would wait for at least 1 item to be available\n  // const batch3 = yield* TxQueue.takeBetween(queue, 1, 3)\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
