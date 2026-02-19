/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: callback
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.444Z
 *
 * Overview:
 * Creates a stream from a callback that can emit values into a queue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Queue, Stream } from "effect"
 *
 * const stream = Stream.callback<number>((queue) =>
 *   Effect.sync(() => {
 *     // Emit values to the stream
 *     Queue.offerUnsafe(queue, 1)
 *     Queue.offerUnsafe(queue, 2)
 *     Queue.offerUnsafe(queue, 3)
 *     // Signal completion
 *     Queue.endUnsafe(queue)
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* stream.pipe(Stream.runCollect)
 *   yield* Console.log(values)
 *   // [ 1, 2, 3 ]
 * })
 *
 * Effect.runPromise(program)
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
const exportName = "callback";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a callback that can emit values into a queue.";
const sourceExample =
  'import { Console, Effect, Queue, Stream } from "effect"\n\nconst stream = Stream.callback<number>((queue) =>\n  Effect.sync(() => {\n    // Emit values to the stream\n    Queue.offerUnsafe(queue, 1)\n    Queue.offerUnsafe(queue, 2)\n    Queue.offerUnsafe(queue, 3)\n    // Signal completion\n    Queue.endUnsafe(queue)\n  })\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* stream.pipe(Stream.runCollect)\n  yield* Console.log(values)\n  // [ 1, 2, 3 ]\n})\n\nEffect.runPromise(program)';
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
