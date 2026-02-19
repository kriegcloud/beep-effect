/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: fail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:50:40.914Z
 *
 * Overview:
 * A sink that always fails with the specified error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that always fails
 * const sink = Sink.fail(new Error("Sink failed"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Sink failed
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
import * as SinkModule from "effect/Sink";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fail";
const exportKind = "const";
const moduleImportPath = "effect/Sink";
const sourceSummary = "A sink that always fails with the specified error.";
const sourceExample =
  'import { Effect, Sink, Stream } from "effect"\n\n// Create a sink that always fails\nconst sink = Sink.fail(new Error("Sink failed"))\n\n// Use it with a stream\nconst stream = Stream.make(1, 2, 3)\nconst program = Stream.run(stream, sink)\n\nEffect.runPromise(program).catch(console.log)\n// Output: Error: Sink failed';
const moduleRecord = SinkModule as Record<string, unknown>;

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
