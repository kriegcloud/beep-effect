/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: interrupt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * Interrupts the queue gracefully, transitioning it to a closing state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 * 
 *   // Add some messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 * 
 *   // Interrupt gracefully - no more offers accepted, but messages can be consumed
 *   const interrupted = yield* Queue.interrupt(queue)
 *   console.log(interrupted) // true
 * 
 *   // Trying to offer more messages will return false
 *   const offerResult = yield* Queue.offer(queue, 3)
 *   console.log(offerResult) // false
 * 
 *   // But we can still take existing messages
 *   const message1 = yield* Queue.take(queue)
 *   console.log(message1) // 1
 * 
 *   const message2 = yield* Queue.take(queue)
 *   console.log(message2) // 2
 * 
 *   // After all messages are consumed, queue is done
 *   const isDone = queue.state._tag === "Done"
 *   console.log(isDone) // true
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
const exportName = "interrupt";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Interrupts the queue gracefully, transitioning it to a closing state.";
const sourceExample = "import { Cause, Effect, Queue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(10)\n\n  // Add some messages\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n\n  // Interrupt gracefully - no more offers accepted, but messages can be consumed\n  const interrupted = yield* Queue.interrupt(queue)\n  console.log(interrupted) // true\n\n  // Trying to offer more messages will return false\n  const offerResult = yield* Queue.offer(queue, 3)\n  console.log(offerResult) // false\n\n  // But we can still take existing messages\n  const message1 = yield* Queue.take(queue)\n  console.log(message1) // 1\n\n  const message2 = yield* Queue.take(queue)\n  console.log(message2) // 2\n\n  // After all messages are consumed, queue is done\n  const isDone = queue.state._tag === \"Done\"\n  console.log(isDone) // true\n})";
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
