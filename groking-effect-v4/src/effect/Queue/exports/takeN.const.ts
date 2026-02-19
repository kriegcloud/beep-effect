/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: takeN
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * Take a specified number of messages from the queue. It will only take up to the capacity of the queue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7])
 *
 *   // Take exactly 3 messages
 *   const first3 = yield* Queue.takeN(queue, 3)
 *   console.log(first3) // [1, 2, 3]
 *
 *   // Take exactly 2 more messages
 *   const next2 = yield* Queue.takeN(queue, 2)
 *   console.log(next2) // [4, 5]
 *
 *   // Take remaining messages (will take 2, even though we asked for 5)
 *   const remaining = yield* Queue.takeN(queue, 5)
 *   console.log(remaining) // [6, 7]
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
const exportName = "takeN";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary =
  "Take a specified number of messages from the queue. It will only take up to the capacity of the queue.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(10)\n\n  // Add several messages\n  yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7])\n\n  // Take exactly 3 messages\n  const first3 = yield* Queue.takeN(queue, 3)\n  console.log(first3) // [1, 2, 3]\n\n  // Take exactly 2 more messages\n  const next2 = yield* Queue.takeN(queue, 2)\n  console.log(next2) // [4, 5]\n\n  // Take remaining messages (will take 2, even though we asked for 5)\n  const remaining = yield* Queue.takeN(queue, 5)\n  console.log(remaining) // [6, 7]\n})';
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
