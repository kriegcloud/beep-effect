/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: zipLatestAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.446Z
 *
 * Overview:
 * Zips multiple streams so that when a value is emitted by any stream, it is combined with the latest values from the other streams to produce a result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const stream = Stream.zipLatestAll(
 *   Stream.make(1, 2, 3).pipe(Stream.rechunk(1)),
 *   Stream.make("a", "b", "c").pipe(Stream.rechunk(1)),
 *   Stream.make(true, false, true).pipe(Stream.rechunk(1))
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(stream)
 *   yield* Console.log(result)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [ [ 1, "a", true ], [ 2, "a", true ], [ 3, "a", true ], [ 3, "b", true ], [ 3, "c", true ], [ 3, "c", false ], [ 3, "c", true ] ]
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
import * as StreamModule from "effect/Stream";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "zipLatestAll";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Zips multiple streams so that when a value is emitted by any stream, it is combined with the latest values from the other streams to produce a result.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst stream = Stream.zipLatestAll(\n  Stream.make(1, 2, 3).pipe(Stream.rechunk(1)),\n  Stream.make(\"a\", \"b\", \"c\").pipe(Stream.rechunk(1)),\n  Stream.make(true, false, true).pipe(Stream.rechunk(1))\n)\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.runCollect(stream)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [ [ 1, \"a\", true ], [ 2, \"a\", true ], [ 3, \"a\", true ], [ 3, \"b\", true ], [ 3, \"c\", true ], [ 3, \"c\", false ], [ 3, \"c\", true ] ]";
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
