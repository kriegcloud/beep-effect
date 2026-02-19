/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: interleave
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.455Z
 *
 * Overview:
 * Interleaves this stream with the specified stream by alternating pulls from each stream; when one ends, the remaining values from the other stream are emitted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.interleave(
 *   Stream.make(2, 3),
 *   Stream.make(5, 6, 7)
 * )
 *
 * const program = Effect.gen(function*() {
 *   const collected = yield* Stream.runCollect(stream)
 *   yield* Console.log(collected)
 * })
 *
 * Effect.runPromise(program)
 * // [2, 5, 3, 6, 7]
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
const exportName = "interleave";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Interleaves this stream with the specified stream by alternating pulls from each stream; when one ends, the remaining values from the other stream are emitted.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.interleave(\n  Stream.make(2, 3),\n  Stream.make(5, 6, 7)\n)\n\nconst program = Effect.gen(function*() {\n  const collected = yield* Stream.runCollect(stream)\n  yield* Console.log(collected)\n})\n\nEffect.runPromise(program)\n// [2, 5, 3, 6, 7]';
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
