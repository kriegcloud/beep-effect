/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: failSync
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:14:20.452Z
 *
 * Overview:
 * A sink that always fails with the specified lazily evaluated error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 * 
 * // Create a sink that fails with a lazy error
 * const sink = Sink.failSync(() => new Error("Lazy error"))
 * 
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 * 
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Lazy error
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SinkModule from "effect/Sink";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "failSync";
const exportKind = "const";
const moduleImportPath = "effect/Sink";
const sourceSummary = "A sink that always fails with the specified lazily evaluated error.";
const sourceExample = "import { Effect, Sink, Stream } from \"effect\"\n\n// Create a sink that fails with a lazy error\nconst sink = Sink.failSync(() => new Error(\"Lazy error\"))\n\n// Use it with a stream\nconst stream = Stream.make(1, 2, 3)\nconst program = Stream.run(stream, sink)\n\nEffect.runPromise(program).catch(console.log)\n// Output: Error: Lazy error";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
