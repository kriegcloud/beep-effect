/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: runIntoQueue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.471Z
 *
 * Overview:
 * Runs the stream, offering each element to the provided queue and ending it with `Cause.Done` when the stream completes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Queue, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(4)
 *
 *   yield* Effect.forkChild(
 *     Stream.runIntoQueue(Stream.fromIterable([1, 2, 3]), queue)
 *   )
 *
 *   const values = [
 *     yield* Queue.take(queue),
 *     yield* Queue.take(queue),
 *     yield* Queue.take(queue)
 *   ]
 *   const done = yield* Effect.flip(Queue.take(queue))
 *
 *   return { values, done }
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runIntoQueue";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Runs the stream, offering each element to the provided queue and ending it with `Cause.Done` when the stream completes.";
const sourceExample =
  'import { Cause, Effect, Queue, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.bounded<number, Cause.Done>(4)\n\n  yield* Effect.forkChild(\n    Stream.runIntoQueue(Stream.fromIterable([1, 2, 3]), queue)\n  )\n\n  const values = [\n    yield* Queue.take(queue),\n    yield* Queue.take(queue),\n    yield* Queue.take(queue)\n  ]\n  const done = yield* Effect.flip(Queue.take(queue))\n\n  return { values, done }\n})';
const moduleRecord = StreamModule as Record<string, unknown>;

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
