/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: Dequeue
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * A `Dequeue` is a queue that can be taken from.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<string, never>(10)
 *
 *   // A Dequeue can only take elements
 *   const dequeue: Queue.Dequeue<string> = queue
 *
 *   // Pre-populate the queue
 *   yield* Queue.offerAll(queue, ["a", "b", "c"])
 *
 *   // Take elements using dequeue interface
 *   const item = yield* Queue.take(dequeue)
 *   console.log(item) // "a"
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as QueueModule from "effect/Queue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Dequeue";
const exportKind = "interface";
const moduleImportPath = "effect/Queue";
const sourceSummary = "A `Dequeue` is a queue that can be taken from.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<string, never>(10)\n\n  // A Dequeue can only take elements\n  const dequeue: Queue.Dequeue<string> = queue\n\n  // Pre-populate the queue\n  yield* Queue.offerAll(queue, ["a", "b", "c"])\n\n  // Take elements using dequeue interface\n  const item = yield* Queue.take(dequeue)\n  console.log(item) // "a"\n})';
const moduleRecord = QueueModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
