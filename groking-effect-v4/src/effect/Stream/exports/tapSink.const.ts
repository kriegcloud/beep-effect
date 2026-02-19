/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: tapSink
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.445Z
 *
 * Overview:
 * Sends all elements emitted by this stream to the specified sink in addition to emitting them.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Ref, Sink, Stream } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const seen = yield* Ref.make<Array<number>>([])
 *   const sink = Sink.forEach((value: number) =>
 *     Ref.update(seen, (items) => [...items, value])
 *   )
 *   const result = yield* Stream.make(1, 2, 3).pipe(
 *     Stream.tapSink(sink),
 *     Stream.runCollect
 *   )
 *   const tapped = yield* Ref.get(seen)
 *   yield* Console.log(tapped)
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [1, 2, 3]
 * // Output: [1, 2, 3]
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
const exportName = "tapSink";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Sends all elements emitted by this stream to the specified sink in addition to emitting them.";
const sourceExample =
  'import { Console, Effect, Ref, Sink, Stream } from "effect"\n\nconst program = Effect.gen(function*() {\n  const seen = yield* Ref.make<Array<number>>([])\n  const sink = Sink.forEach((value: number) =>\n    Ref.update(seen, (items) => [...items, value])\n  )\n  const result = yield* Stream.make(1, 2, 3).pipe(\n    Stream.tapSink(sink),\n    Stream.runCollect\n  )\n  const tapped = yield* Ref.get(seen)\n  yield* Console.log(tapped)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [1, 2, 3]\n// Output: [1, 2, 3]';
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
