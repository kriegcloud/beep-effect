/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: aggregateWithin
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.436Z
 *
 * Overview:
 * Aggregates elements with a sink, emitting each result when the sink completes or the schedule triggers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule, Sink, Stream } from "effect"
 *
 * Effect.runPromise(Effect.gen(function* () {
 *   const aggregated = yield* Stream.runCollect(
 *     Stream.make(1, 2, 3, 4, 5, 6).pipe(
 *       Stream.aggregateWithin(
 *         Sink.foldUntil(() => 0, 3, (sum, n) => Effect.succeed(sum + n)),
 *         Schedule.spaced("1 minute")
 *       )
 *     )
 *   )
 *   yield* Console.log(aggregated)
 * }))
 * // Output: [ 6, 15 ]
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
const exportName = "aggregateWithin";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Aggregates elements with a sink, emitting each result when the sink completes or the schedule triggers.";
const sourceExample =
  'import { Console, Effect, Schedule, Sink, Stream } from "effect"\n\nEffect.runPromise(Effect.gen(function* () {\n  const aggregated = yield* Stream.runCollect(\n    Stream.make(1, 2, 3, 4, 5, 6).pipe(\n      Stream.aggregateWithin(\n        Sink.foldUntil(() => 0, 3, (sum, n) => Effect.succeed(sum + n)),\n        Schedule.spaced("1 minute")\n      )\n    )\n  )\n  yield* Console.log(aggregated)\n}))\n// Output: [ 6, 15 ]';
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
