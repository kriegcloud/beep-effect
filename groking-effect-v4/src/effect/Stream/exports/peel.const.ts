/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: peel
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Runs a sink to peel off enough elements to produce a value and returns that value with the remaining stream in a scope.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 * 
 * const stream = Stream.fromArrays([1, 2, 3], [4, 5, 6])
 * const sink = Sink.take<number>(3)
 * 
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const [peeled, rest] = yield* Stream.peel(stream, sink)
 *     const remaining = yield* Stream.runCollect(rest)
 *     yield* Console.log([peeled, remaining])
 *   })
 * )
 * 
 * Effect.runPromise(program)
 * // Output: [ [1, 2, 3], [4, 5, 6] ]
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
const exportName = "peel";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Runs a sink to peel off enough elements to produce a value and returns that value with the remaining stream in a scope.";
const sourceExample = "import { Console, Effect, Sink, Stream } from \"effect\"\n\nconst stream = Stream.fromArrays([1, 2, 3], [4, 5, 6])\nconst sink = Sink.take<number>(3)\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const [peeled, rest] = yield* Stream.peel(stream, sink)\n    const remaining = yield* Stream.runCollect(rest)\n    yield* Console.log([peeled, remaining])\n  })\n)\n\nEffect.runPromise(program)\n// Output: [ [1, 2, 3], [4, 5, 6] ]";
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
