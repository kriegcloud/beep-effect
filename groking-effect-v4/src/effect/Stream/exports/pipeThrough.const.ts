/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: pipeThrough
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.467Z
 *
 * Overview:
 * Pipes the stream through `Sink.toChannel`, emitting only the sink leftovers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const leftovers = yield* Stream.make(1, 2, 3, 4).pipe(
 *     Stream.pipeThrough(Sink.take(2)),
 *     Stream.runCollect
 *   )
 *
 *   yield* Console.log(leftovers)
 * })
 *
 * Effect.runPromise(program)
 * //=> [ 3, 4 ]
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
const exportName = "pipeThrough";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Pipes the stream through `Sink.toChannel`, emitting only the sink leftovers.";
const sourceExample =
  'import { Console, Effect, Sink, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const leftovers = yield* Stream.make(1, 2, 3, 4).pipe(\n    Stream.pipeThrough(Sink.take(2)),\n    Stream.runCollect\n  )\n\n  yield* Console.log(leftovers)\n})\n\nEffect.runPromise(program)\n//=> [ 3, 4 ]';
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
