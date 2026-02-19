/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: offerAllUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.493Z
 *
 * Overview:
 * Add multiple messages to the queue synchronously. Returns the remaining messages that were not added.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * // Create a bounded queue and use unsafe API
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 *
 *   // Try to add 5 messages to capacity-3 queue using unsafe API
 *   const remaining = Queue.offerAllUnsafe(queue, [1, 2, 3, 4, 5])
 *   console.log(remaining) // [4, 5] - couldn't fit the last 2
 *
 *   // Check what's in the queue
 *   const size = Queue.sizeUnsafe(queue)
 *   console.log(size) // 3
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
const exportName = "offerAllUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary =
  "Add multiple messages to the queue synchronously. Returns the remaining messages that were not added.";
const sourceExample =
  "import { Cause, Effect, Queue } from \"effect\"\n\n// Create a bounded queue and use unsafe API\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(3)\n\n  // Try to add 5 messages to capacity-3 queue using unsafe API\n  const remaining = Queue.offerAllUnsafe(queue, [1, 2, 3, 4, 5])\n  console.log(remaining) // [4, 5] - couldn't fit the last 2\n\n  // Check what's in the queue\n  const size = Queue.sizeUnsafe(queue)\n  console.log(size) // 3\n})";
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
