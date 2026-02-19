/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Done
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * A graceful completion signal for queues and streams.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.end(queue)
 *
 *   const result = yield* Effect.flip(Queue.take(queue))
 *   console.log(Cause.isDone(result)) // true
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Done";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A graceful completion signal for queues and streams.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(10)\n  yield* Queue.offer(queue, 1)\n  yield* Queue.end(queue)\n\n  const result = yield* Effect.flip(Queue.take(queue))\n  console.log(Cause.isDone(result)) // true\n})';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Bridge note: `Cause.Done` is a compile-time type and does not exist as a runtime value.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleQueueDoneCompanionFlow = Effect.gen(function* () {
  yield* Console.log("Use runtime companions (`Queue` + `Cause.isDone`) to observe a done signal.");
  yield* inspectNamedExport({ moduleRecord, exportName: "isDone" });

  const queue = yield* Queue.bounded<number, CauseModule.Done>(2);
  yield* Queue.offer(queue, 1);
  yield* Queue.end(queue);

  const first = yield* Queue.take(queue);
  yield* Console.log(`First take (buffered value): ${first}`);

  const completionSignal = yield* Effect.flip(Queue.take(queue));
  const done = CauseModule.isDone(completionSignal);
  yield* Console.log(`Second take is done signal: ${done}`);
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
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Queue Completion Companion Flow",
      description: "End a queue, drain remaining value, then detect the runtime done signal with Cause.isDone.",
      run: exampleQueueDoneCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
