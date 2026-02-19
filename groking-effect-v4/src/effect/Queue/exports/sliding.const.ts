/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: sliding
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * Creates a bounded queue with sliding strategy. When the queue reaches capacity, new elements are added and the oldest elements are dropped.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.sliding<number>(3)
 *
 *   // Fill the queue to capacity
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *   yield* Queue.offer(queue, 3)
 *
 *   // This will succeed, dropping the oldest element (1)
 *   yield* Queue.offer(queue, 4)
 *
 *   const all = yield* Queue.takeAll(queue)
 *   console.log(all) // [2, 3, 4] - oldest element (1) was dropped
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
const exportName = "sliding";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary =
  "Creates a bounded queue with sliding strategy. When the queue reaches capacity, new elements are added and the oldest elements are dropped.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.sliding<number>(3)\n\n  // Fill the queue to capacity\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n  yield* Queue.offer(queue, 3)\n\n  // This will succeed, dropping the oldest element (1)\n  yield* Queue.offer(queue, 4)\n\n  const all = yield* Queue.takeAll(queue)\n  console.log(all) // [2, 3, 4] - oldest element (1) was dropped\n})';
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
