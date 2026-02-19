/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: runForEachArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.471Z
 *
 * Overview:
 * Consumes the stream in chunks, passing each non-empty array to the callback.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2, 3, 4, 5)
 * const program = Effect.gen(function*() {
 *   yield* Stream.runForEachArray(
 *     stream,
 *     (chunk) => Console.log(`Processing chunk: ${chunk.join(", ")}`)
 *   )
 * })
 *
 * Effect.runPromise(program)
 * // Processing chunk: 1, 2, 3, 4, 5
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
const exportName = "runForEachArray";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Consumes the stream in chunks, passing each non-empty array to the callback.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2, 3, 4, 5)\nconst program = Effect.gen(function*() {\n  yield* Stream.runForEachArray(\n    stream,\n    (chunk) => Console.log(`Processing chunk: ${chunk.join(", ")}`)\n  )\n})\n\nEffect.runPromise(program)\n// Processing chunk: 1, 2, 3, 4, 5';
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
