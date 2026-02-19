/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: interruptWhen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.455Z
 *
 * Overview:
 * Interrupts the evaluation of this stream when the provided effect completes. The given effect will be forked as part of this stream, and its success will be discarded. This combinator will also interrupt any in-progress element being pulled from upstream.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Deferred, Effect, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const interrupt = yield* Deferred.make<void>()
 *   const stream = Stream.make(1, 2, 3).pipe(
 *     Stream.tap((value) =>
 *       value === 2
 *         ? Deferred.succeed(interrupt, void 0)
 *         : Effect.void
 *     ),
 *     Stream.interruptWhen(Deferred.await(interrupt))
 *   )
 *
 *   const result = yield* Stream.runCollect(stream)
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // => [1, 2]
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
const exportName = "interruptWhen";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Interrupts the evaluation of this stream when the provided effect completes. The given effect will be forked as part of this stream, and its success will be discarded. This comb...";
const sourceExample =
  'import { Console, Deferred, Effect, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const interrupt = yield* Deferred.make<void>()\n  const stream = Stream.make(1, 2, 3).pipe(\n    Stream.tap((value) =>\n      value === 2\n        ? Deferred.succeed(interrupt, void 0)\n        : Effect.void\n    ),\n    Stream.interruptWhen(Deferred.await(interrupt))\n  )\n\n  const result = yield* Stream.runCollect(stream)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// => [1, 2]';
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
