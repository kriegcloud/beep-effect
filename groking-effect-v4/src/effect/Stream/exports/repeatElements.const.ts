/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: repeatElements
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Repeats each element of the stream according to the provided schedule, including the original emission.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.make("A", "B", "C").pipe(
 *     Stream.repeatElements(Schedule.recurs(1)),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ "A", "A", "B", "B", "C", "C" ]
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
const exportName = "repeatElements";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Repeats each element of the stream according to the provided schedule, including the original emission.";
const sourceExample =
  'import { Console, Effect, Schedule, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.make("A", "B", "C").pipe(\n    Stream.repeatElements(Schedule.recurs(1)),\n    Stream.runCollect\n  )\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ "A", "A", "B", "B", "C", "C" ]';
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
