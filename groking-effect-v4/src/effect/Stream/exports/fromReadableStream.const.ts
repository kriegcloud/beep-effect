/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromReadableStream
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.439Z
 *
 * Overview:
 * Creates a stream from a `ReadableStream`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const readableStream = new ReadableStream({
 *   start(controller) {
 *     controller.enqueue(1)
 *     controller.enqueue(2)
 *     controller.enqueue(3)
 *     controller.close()
 *   }
 * })
 *
 * const program = Effect.gen(function*() {
 *   const stream = Stream.fromReadableStream({
 *     evaluate: () => readableStream,
 *     onError: (error) => new Error(String(error))
 *   })
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
const exportName = "fromReadableStream";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from a `ReadableStream`.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst readableStream = new ReadableStream({\n  start(controller) {\n    controller.enqueue(1)\n    controller.enqueue(2)\n    controller.enqueue(3)\n    controller.close()\n  }\n})\n\nconst program = Effect.gen(function*() {\n  const stream = Stream.fromReadableStream({\n    evaluate: () => readableStream,\n    onError: (error) => new Error(String(error))\n  })\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 3 ]';
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
