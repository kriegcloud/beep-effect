/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: pipeThroughChannel
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Pipes this stream through a channel that consumes and emits chunked elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Channel, Console, Effect, Stream } from "effect"
 *
 * type NumberChunk = readonly [number, ...Array<number>]
 *
 * const doubleChunks = Channel.identity<NumberChunk, never, unknown>().pipe(
 *   Channel.map((chunk) => Array.map(chunk, (n) => n * 2))
 * )
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.fromArray([1, 2, 3]).pipe(
 *     Stream.rechunk(2),
 *     Stream.pipeThroughChannel(doubleChunks),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // => [2, 4, 6]
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
const exportName = "pipeThroughChannel";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Pipes this stream through a channel that consumes and emits chunked elements.";
const sourceExample =
  'import { Array, Channel, Console, Effect, Stream } from "effect"\n\ntype NumberChunk = readonly [number, ...Array<number>]\n\nconst doubleChunks = Channel.identity<NumberChunk, never, unknown>().pipe(\n  Channel.map((chunk) => Array.map(chunk, (n) => n * 2))\n)\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.fromArray([1, 2, 3]).pipe(\n    Stream.rechunk(2),\n    Stream.pipeThroughChannel(doubleChunks),\n    Stream.runCollect\n  )\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// => [2, 4, 6]';
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
