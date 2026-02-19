/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Done
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.143Z
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
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Done";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A graceful completion signal for queues and streams.";
const sourceExample = "import { Cause, Effect, Queue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(10)\n  yield* Queue.offer(queue, 1)\n  yield* Queue.end(queue)\n\n  const result = yield* Effect.flip(Queue.take(queue))\n  console.log(Cause.isDone(result)) // true\n})";
const moduleRecord = CauseModule as Record<string, unknown>;

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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
