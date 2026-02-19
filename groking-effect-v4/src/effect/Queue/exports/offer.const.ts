/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: offer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * Add a message to the queue. Returns `false` if the queue is done.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 * 
 *   // Successfully add messages to queue
 *   const success1 = yield* Queue.offer(queue, 1)
 *   const success2 = yield* Queue.offer(queue, 2)
 *   console.log(success1, success2) // true, true
 * 
 *   // Queue state
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 2
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
const exportName = "offer";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Add a message to the queue. Returns `false` if the queue is done.";
const sourceExample = "import { Cause, Effect, Queue } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number>(3)\n\n  // Successfully add messages to queue\n  const success1 = yield* Queue.offer(queue, 1)\n  const success2 = yield* Queue.offer(queue, 2)\n  console.log(success1, success2) // true, true\n\n  // Queue state\n  const size = yield* Queue.size(queue)\n  console.log(size) // 2\n})";
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
