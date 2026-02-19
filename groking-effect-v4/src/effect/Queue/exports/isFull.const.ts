/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: isFull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * Check if the queue is full.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(3)
 *
 *   console.log(yield* Queue.isFull(queue)) // false
 *
 *   // Add some messages
 *   yield* Queue.offerAll(queue, [1, 2, 3])
 *
 *   console.log(yield* Queue.isFull(queue)) // true
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
const exportName = "isFull";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Check if the queue is full.";
const sourceExample =
  'import { Cause, Effect, Option, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(3)\n\n  console.log(yield* Queue.isFull(queue)) // false\n\n  // Add some messages\n  yield* Queue.offerAll(queue, [1, 2, 3])\n\n  console.log(yield* Queue.isFull(queue)) // true\n})';
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
