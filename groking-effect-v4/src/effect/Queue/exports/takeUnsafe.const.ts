/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: takeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.494Z
 *
 * Overview:
 * Take a single message from the queue synchronously, or wait for a message to be available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Queue } from "effect"
 *
 * // Create a queue and use unsafe operations
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *   Queue.offerUnsafe(queue, 2)
 *
 *   // Take a message synchronously
 *   const result1 = Queue.takeUnsafe(queue)
 *   console.log(result1) // Success(1) or Exit containing value 1
 *
 *   const result2 = Queue.takeUnsafe(queue)
 *   console.log(result2) // Success(2)
 *
 *   // No more messages - returns undefined
 *   const result3 = Queue.takeUnsafe(queue)
 *   console.log(result3) // undefined
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
const exportName = "takeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Take a single message from the queue synchronously, or wait for a message to be available.";
const sourceExample =
  'import { Effect, Queue } from "effect"\n\n// Create a queue and use unsafe operations\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(10)\n\n  // Add some messages\n  Queue.offerUnsafe(queue, 1)\n  Queue.offerUnsafe(queue, 2)\n\n  // Take a message synchronously\n  const result1 = Queue.takeUnsafe(queue)\n  console.log(result1) // Success(1) or Exit containing value 1\n\n  const result2 = Queue.takeUnsafe(queue)\n  console.log(result2) // Success(2)\n\n  // No more messages - returns undefined\n  const result3 = Queue.takeUnsafe(queue)\n  console.log(result3) // undefined\n})';
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
