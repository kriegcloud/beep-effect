/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: failCauseSync
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:50:40.914Z
 *
 * Overview:
 * Creates a sink halting with a specified lazily evaluated `Cause`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a lazy cause
 * const sink = Sink.failCauseSync(() => Cause.fail(new Error("Lazy cause")))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Lazy cause
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
const exportName = "failCauseSync";
const exportKind = "const";
const moduleImportPath = "effect/Sink";
const sourceSummary = "Creates a sink halting with a specified lazily evaluated `Cause`.";
const sourceExample =
  'import { Cause, Effect, Sink, Stream } from "effect"\n\n// Create a sink that fails with a lazy cause\nconst sink = Sink.failCauseSync(() => Cause.fail(new Error("Lazy cause")))\n\n// Use it with a stream\nconst stream = Stream.make(1, 2, 3)\nconst program = Stream.run(stream, sink)\n\nEffect.runPromise(program).catch(console.log)\n// Output: Error: Lazy cause';
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
