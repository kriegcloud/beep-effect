/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Queue
 * Export: fail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Queue.ts
 * Generated: 2026-02-19T04:14:16.041Z
 *
 * Overview:
 * Fail the queue with an error. If the queue is already done, `false` is returned.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, string>(10)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *
 *   // Fail the queue with an error
 *   const failed = yield* Queue.fail(queue, "Something went wrong")
 *   console.log(failed) // true
 *
 *   // Subsequent operations will reflect the failure
 *   // Taking from failed queue will fail with the error
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
const exportName = "fail";
const exportKind = "const";
const moduleImportPath = "effect/Queue";
const sourceSummary = "Fail the queue with an error. If the queue is already done, `false` is returned.";
const sourceExample =
  'import { Cause, Effect, Queue } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, string>(10)\n\n  // Add some messages\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n\n  // Fail the queue with an error\n  const failed = yield* Queue.fail(queue, "Something went wrong")\n  console.log(failed) // true\n\n  // Subsequent operations will reflect the failure\n  // Taking from failed queue will fail with the error\n})';
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
