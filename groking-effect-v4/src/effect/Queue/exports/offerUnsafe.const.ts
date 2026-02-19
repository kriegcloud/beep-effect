/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: offerUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.493Z
 *
 * Overview:
 * Add a message to the queue synchronously. Returns `false` if the queue is done.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * // Create a queue effect and extract the queue for unsafe operations
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 *
 *   // Add messages synchronously using unsafe API
 *   const success1 = Queue.offerUnsafe(queue, 1)
 *   const success2 = Queue.offerUnsafe(queue, 2)
 *   console.log(success1, success2) // true, true
 *
 *   // Check current size
 *   const size = Queue.sizeUnsafe(queue)
 *   console.log(size) // 2
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
const exportName = "offerUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Add a message to the queue synchronously. Returns `false` if the queue is done.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\n// Create a queue effect and extract the queue for unsafe operations\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(3)\n\n  // Add messages synchronously using unsafe API\n  const success1 = Queue.offerUnsafe(queue, 1)\n  const success2 = Queue.offerUnsafe(queue, 2)\n  console.log(success1, success2) // true, true\n\n  // Check current size\n  const size = Queue.sizeUnsafe(queue)\n  console.log(size) // 2\n})';
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
