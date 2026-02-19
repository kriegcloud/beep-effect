/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: forEachArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:14:20.452Z
 *
 * Overview:
 * A sink that executes the provided effectful function for every Chunk fed to it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 * 
 * // Create a sink that processes chunks
 * const sink = Sink.forEachArray((chunk: ReadonlyArray<number>) =>
 *   Console.log(
 *     `Processing chunk of ${chunk.length} items: [${chunk.join(", ")}]`
 *   )
 * )
 * 
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3, 4, 5)
 * const program = Stream.run(stream, sink)
 * 
 * Effect.runPromise(program)
 * // Output: Processing chunk of 5 items: [1, 2, 3, 4, 5]
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
const exportName = "forEachArray";
const exportKind = "const";
const moduleImportPath = "effect/Sink";
const sourceSummary = "A sink that executes the provided effectful function for every Chunk fed to it.";
const sourceExample = "import { Console, Effect, Sink, Stream } from \"effect\"\n\n// Create a sink that processes chunks\nconst sink = Sink.forEachArray((chunk: ReadonlyArray<number>) =>\n  Console.log(\n    `Processing chunk of ${chunk.length} items: [${chunk.join(\", \")}]`\n  )\n)\n\n// Use it with a stream\nconst stream = Stream.make(1, 2, 3, 4, 5)\nconst program = Stream.run(stream, sink)\n\nEffect.runPromise(program)\n// Output: Processing chunk of 5 items: [1, 2, 3, 4, 5]";
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
