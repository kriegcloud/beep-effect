/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: flattenTake
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.450Z
 *
 * Overview:
 * Unwraps `Take` values, emitting elements from non-empty arrays and ending or failing when the `Exit` signals completion.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Console, Effect, Exit, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const takes = Stream.make(
 *     Array.make(1, 2),
 *     Array.make(3),
 *     Exit.succeed<void>(undefined)
 *   )
 *
 *   const values = yield* Stream.flattenTake(takes).pipe(Stream.runCollect)
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2, 3 ]
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
const exportName = "flattenTake";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Unwraps `Take` values, emitting elements from non-empty arrays and ending or failing when the `Exit` signals completion.";
const sourceExample =
  'import { Array, Console, Effect, Exit, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const takes = Stream.make(\n    Array.make(1, 2),\n    Array.make(3),\n    Exit.succeed<void>(undefined)\n  )\n\n  const values = yield* Stream.flattenTake(takes).pipe(Stream.runCollect)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 3 ]';
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
