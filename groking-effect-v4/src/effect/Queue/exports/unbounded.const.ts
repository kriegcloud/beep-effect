/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: unbounded
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:50:38.494Z
 *
 * Overview:
 * Creates an unbounded queue that can grow to any size without blocking producers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.unbounded<string>()
 *
 *   // Producers can always add messages without blocking
 *   yield* Queue.offer(queue, "message1")
 *   yield* Queue.offer(queue, "message2")
 *   yield* Queue.offerAll(queue, ["message3", "message4", "message5"])
 *
 *   // Check current size
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // Some(5)
 *
 *   // Take all messages
 *   const messages = yield* Queue.takeAll(queue)
 *   console.log(messages) // ["message1", "message2", "message3", "message4", "message5"]
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
const exportName = "unbounded";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Creates an unbounded queue that can grow to any size without blocking producers.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.unbounded<string>()\n\n  // Producers can always add messages without blocking\n  yield* Queue.offer(queue, "message1")\n  yield* Queue.offer(queue, "message2")\n  yield* Queue.offerAll(queue, ["message3", "message4", "message5"])\n\n  // Check current size\n  const size = yield* Queue.size(queue)\n  console.log(size) // Some(5)\n\n  // Take all messages\n  const messages = yield* Queue.takeAll(queue)\n  console.log(messages) // ["message1", "message2", "message3", "message4", "message5"]\n})';
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
