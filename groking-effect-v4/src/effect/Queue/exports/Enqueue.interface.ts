/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: Enqueue
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * An `Enqueue` is a queue that can be offered to.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Queue } from "effect"
 * 
 * // Function that only needs write access to a queue
 * const producer = (enqueue: Queue.Enqueue<string>) =>
 *   Effect.gen(function*() {
 *     yield* Queue.offer(enqueue as Queue.Queue<string>, "hello")
 *     yield* Queue.offerAll(enqueue as Queue.Queue<string>, ["world", "!"])
 *   })
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<string>(10)
 *   yield* producer(queue)
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
import * as QueueModule from "effect/Queue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Enqueue";
const exportKind = "interface";
const moduleImportPath = "effect/Queue";
const sourceSummary = "An `Enqueue` is a queue that can be offered to.";
const sourceExample = "import { Effect, Queue } from \"effect\"\n\n// Function that only needs write access to a queue\nconst producer = (enqueue: Queue.Enqueue<string>) =>\n  Effect.gen(function*() {\n    yield* Queue.offer(enqueue as Queue.Queue<string>, \"hello\")\n    yield* Queue.offerAll(enqueue as Queue.Queue<string>, [\"world\", \"!\"])\n  })\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<string>(10)\n  yield* producer(queue)\n})";
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
