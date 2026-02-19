/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: toAsyncIterableEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.480Z
 *
 * Overview:
 * Creates an effect that yields an `AsyncIterable` using the current services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2, 3)
 *
 * const program = Effect.gen(function*() {
 *   const iterable = yield* Stream.toAsyncIterableEffect(stream)
 *   const values = yield* Effect.promise(async () => {
 *     const collected: Array<number> = []
 *     for await (const value of iterable) {
 *       collected.push(value)
 *     }
 *     return collected
 *   })
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * //=> [ 1, 2, 3 ]
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
const exportName = "toAsyncIterableEffect";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates an effect that yields an `AsyncIterable` using the current services.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2, 3)\n\nconst program = Effect.gen(function*() {\n  const iterable = yield* Stream.toAsyncIterableEffect(stream)\n  const values = yield* Effect.promise(async () => {\n    const collected: Array<number> = []\n    for await (const value of iterable) {\n      collected.push(value)\n    }\n    return collected\n  })\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n//=> [ 1, 2, 3 ]';
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
