/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: mapEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.459Z
 *
 * Overview:
 * Maps over elements of the stream with the specified effectful function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2, 3)
 *
 * const mappedStream = stream.pipe(
 *   Stream.mapEffect((n) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Processing: ${n}`)
 *       return n * 2
 *     })
 *   )
 * )
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(mappedStream)
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // Output:
 * // Processing: 1
 * // Processing: 2
 * // Processing: 3
 * // [2, 4, 6]
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
const exportName = "mapEffect";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Maps over elements of the stream with the specified effectful function.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2, 3)\n\nconst mappedStream = stream.pipe(\n  Stream.mapEffect((n) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Processing: ${n}`)\n      return n * 2\n    })\n  )\n)\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.runCollect(mappedStream)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output:\n// Processing: 1\n// Processing: 2\n// Processing: 3\n// [2, 4, 6]';
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
