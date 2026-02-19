/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: partition
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.463Z
 *
 * Overview:
 * Splits a stream into excluded and satisfying substreams using a predicate, refinement, or Filter.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const [excluded, satisfying] = yield* Stream.partition(
 *     Stream.make(1, 2, 3, 4),
 *     (n) => n % 2 === 0
 *   )
 *   const left = yield* Stream.runCollect(excluded)
 *   const right = yield* Stream.runCollect(satisfying)
 *   yield* Console.log(left)
 *   // Output: [ 1, 3 ]
 *   yield* Console.log(right)
 *   // Output: [ 2, 4 ]
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
const exportName = "partition";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Splits a stream into excluded and satisfying substreams using a predicate, refinement, or Filter.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const [excluded, satisfying] = yield* Stream.partition(\n    Stream.make(1, 2, 3, 4),\n    (n) => n % 2 === 0\n  )\n  const left = yield* Stream.runCollect(excluded)\n  const right = yield* Stream.runCollect(satisfying)\n  yield* Console.log(left)\n  // Output: [ 1, 3 ]\n  yield* Console.log(right)\n  // Output: [ 2, 4 ]\n})';
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
