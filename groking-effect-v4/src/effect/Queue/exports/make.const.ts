/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * A `Queue` is an asynchronous queue that can be offered to and taken from.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 * import * as assert from "node:assert"
 * 
 * Effect.gen(function*() {
 *   const queue = yield* Queue.make<number, string | Cause.Done>()
 * 
 *   // add messages to the queue
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *   yield* Queue.offerAll(queue, [3, 4, 5])
 * 
 *   // take messages from the queue
 *   const messages = yield* Queue.takeAll(queue)
 *   assert.deepStrictEqual(messages, [1, 2, 3, 4, 5])
 * 
 *   // signal that the queue is done
 *   yield* Queue.end(queue)
 *   const done = yield* Effect.flip(Queue.takeAll(queue))
 *   assert.deepStrictEqual(done, Cause.Done)
 * 
 *   // signal that the queue has failed
 *   yield* Queue.fail(queue, "boom")
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as QueueModule from "effect/Queue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "A `Queue` is an asynchronous queue that can be offered to and taken from.";
const sourceExample = "import { Cause, Effect, Queue } from \"effect\"\nimport * as assert from \"node:assert\"\n\nEffect.gen(function*() {\n  const queue = yield* Queue.make<number, string | Cause.Done>()\n\n  // add messages to the queue\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n  yield* Queue.offerAll(queue, [3, 4, 5])\n\n  // take messages from the queue\n  const messages = yield* Queue.takeAll(queue)\n  assert.deepStrictEqual(messages, [1, 2, 3, 4, 5])\n\n  // signal that the queue is done\n  yield* Queue.end(queue)\n  const done = yield* Effect.flip(Queue.takeAll(queue))\n  assert.deepStrictEqual(done, Cause.Done)\n\n  // signal that the queue has failed\n  yield* Queue.fail(queue, \"boom\")\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
