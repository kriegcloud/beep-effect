/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: zipFlatten
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.446Z
 *
 * Overview:
 * Zips this stream with another point-wise and emits tuples of elements from both streams, flattening the left tuple.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const stream1 = Stream.make(
 *     [1, "a"] as const,
 *     [2, "b"] as const,
 *     [3, "c"] as const
 *   )
 *   const stream2 = Stream.make("x", "y", "z")
 *   const result = yield* Stream.zipFlatten(stream1, stream2).pipe(Stream.runCollect)
 * 
 *   yield* Console.log(result)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [[1, "a", "x"], [2, "b", "y"], [3, "c", "z"]]
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
const exportName = "zipFlatten";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Zips this stream with another point-wise and emits tuples of elements from both streams, flattening the left tuple.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const stream1 = Stream.make(\n    [1, \"a\"] as const,\n    [2, \"b\"] as const,\n    [3, \"c\"] as const\n  )\n  const stream2 = Stream.make(\"x\", \"y\", \"z\")\n  const result = yield* Stream.zipFlatten(stream1, stream2).pipe(Stream.runCollect)\n\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [[1, \"a\", \"x\"], [2, \"b\", \"y\"], [3, \"c\", \"z\"]]";
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
