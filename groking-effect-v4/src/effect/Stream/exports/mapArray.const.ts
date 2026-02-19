/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: mapArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.440Z
 *
 * Overview:
 * Transforms each emitted chunk using the provided function, which receives the chunk and its index.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Console, Effect, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.make(1, 2, 3, 4).pipe(
 *     Stream.rechunk(2),
 *     Stream.mapArray((chunk, index) => Array.map(chunk, (n) => n + index)),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2, 4, 5 ]
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapArray";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Transforms each emitted chunk using the provided function, which receives the chunk and its index.";
const sourceExample =
  'import { Array, Console, Effect, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.make(1, 2, 3, 4).pipe(\n    Stream.rechunk(2),\n    Stream.mapArray((chunk, index) => Array.map(chunk, (n) => n + index)),\n    Stream.runCollect\n  )\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 4, 5 ]';
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
