/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: Queue
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.042Z
 *
 * Overview:
 * A `Queue` is an asynchronous queue that can be offered to and taken from.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a bounded queue
 *   const queue = yield* Queue.bounded<string>(10)
 *
 *   // Producer: offer items to the queue
 *   yield* Queue.offer(queue, "hello")
 *   yield* Queue.offerAll(queue, ["world", "!"])
 *
 *   // Consumer: take items from the queue
 *   const item1 = yield* Queue.take(queue)
 *   const item2 = yield* Queue.take(queue)
 *   const item3 = yield* Queue.take(queue)
 *
 *   console.log([item1, item2, item3]) // ["hello", "world", "!"]
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
const exportName = "Queue";
const exportKind = "interface";
const moduleImportPath = "effect/Queue";
const sourceSummary = "A `Queue` is an asynchronous queue that can be offered to and taken from.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a bounded queue\n  const queue = yield* Queue.bounded<string>(10)\n\n  // Producer: offer items to the queue\n  yield* Queue.offer(queue, "hello")\n  yield* Queue.offerAll(queue, ["world", "!"])\n\n  // Consumer: take items from the queue\n  const item1 = yield* Queue.take(queue)\n  const item2 = yield* Queue.take(queue)\n  const item3 = yield* Queue.take(queue)\n\n  console.log([item1, item2, item3]) // ["hello", "world", "!"]\n})';
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
