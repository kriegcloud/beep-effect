/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.449Z
 *
 * Overview:
 * Provides the entry point for do-notation style stream composition.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream, pipe } from "effect"
 *
 * const program = pipe(
 *   Stream.Do,
 *   Stream.bind("value", () => Stream.fromArray([1, 2])),
 *   Stream.let("next", ({ value }) => value + 1)
 * )
 *
 * const effect = Effect.gen(function*() {
 *   const collected = yield* Stream.runCollect(program)
 *   yield* Console.log(collected)
 * })
 *
 * Effect.runPromise(effect)
 * //=> [{ value: 1, next: 2 }, { value: 2, next: 3 }]
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
const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Provides the entry point for do-notation style stream composition.";
const sourceExample =
  'import { Console, Effect, Stream, pipe } from "effect"\n\nconst program = pipe(\n  Stream.Do,\n  Stream.bind("value", () => Stream.fromArray([1, 2])),\n  Stream.let("next", ({ value }) => value + 1)\n)\n\nconst effect = Effect.gen(function*() {\n  const collected = yield* Stream.runCollect(program)\n  yield* Console.log(collected)\n})\n\nEffect.runPromise(effect)\n//=> [{ value: 1, next: 2 }, { value: 2, next: 3 }]';
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
