/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromQueue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.439Z
 *
 * Overview:
 * Creates a stream from a queue of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Queue, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.unbounded<number>()
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *   yield* Queue.offer(queue, 3)
 *   yield* Queue.shutdown(queue)
 *
 *   const stream = Stream.fromQueue(queue)
 *   const values = yield* Stream.runCollect(stream)
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2, 3 ]
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromQueue";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a queue of values.";
const sourceExample =
  'import { Console, Effect, Queue, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const queue = yield* Queue.unbounded<number>()\n  yield* Queue.offer(queue, 1)\n  yield* Queue.offer(queue, 2)\n  yield* Queue.offer(queue, 3)\n  yield* Queue.shutdown(queue)\n\n  const stream = Stream.fromQueue(queue)\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 3 ]';
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
