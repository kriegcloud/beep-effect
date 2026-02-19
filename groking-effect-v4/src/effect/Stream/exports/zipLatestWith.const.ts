/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: zipLatestWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.483Z
 *
 * Overview:
 * Combines the latest values from both streams whenever either emits, using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * Effect.gen(function*() {
 *   const result = yield* Stream.make(1, 2, 3).pipe(
 *     Stream.rechunk(1),
 *     Stream.zipLatestWith(
 *       Stream.make(10, 20).pipe(Stream.rechunk(1)),
 *       (n, m) => n + m
 *     ),
 *     Stream.runCollect
 *   )
 *
 *   yield* Console.log(result)
 *   // Output: [ 11, 12, 22, 23 ]
 * })
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
const exportName = "zipLatestWith";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Combines the latest values from both streams whenever either emits, using the provided function.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nEffect.gen(function*() {\n  const result = yield* Stream.make(1, 2, 3).pipe(\n    Stream.rechunk(1),\n    Stream.zipLatestWith(\n      Stream.make(10, 20).pipe(Stream.rechunk(1)),\n      (n, m) => n + m\n    ),\n    Stream.runCollect\n  )\n\n  yield* Console.log(result)\n  // Output: [ 11, 12, 22, 23 ]\n})';
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
