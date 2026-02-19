/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: mapAccumArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.440Z
 *
 * Overview:
 * Statefully maps over non-empty chunk arrays, emitting zero or more values per chunk.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const output = yield* Stream.make(1, 2, 3, 4, 5, 6).pipe(
 *     Stream.rechunk(2),
 *     Stream.mapAccumArray(() => 0, (sum: number, chunk) => {
 *       const next = chunk.reduce((acc, n) => acc + n, sum)
 *       return [next, [next]]
 *     }),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(output)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [ 3, 10, 21 ]
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
const exportName = "mapAccumArray";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Statefully maps over non-empty chunk arrays, emitting zero or more values per chunk.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const output = yield* Stream.make(1, 2, 3, 4, 5, 6).pipe(\n    Stream.rechunk(2),\n    Stream.mapAccumArray(() => 0, (sum: number, chunk) => {\n      const next = chunk.reduce((acc, n) => acc + n, sum)\n      return [next, [next]]\n    }),\n    Stream.runCollect\n  )\n  yield* Console.log(output)\n})\n\nEffect.runPromise(program)\n// Output: [ 3, 10, 21 ]";
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
