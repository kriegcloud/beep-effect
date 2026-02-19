/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: combineArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.445Z
 *
 * Overview:
 * Combines the arrays (chunks) from this stream and the specified stream by repeatedly applying the function `f` to extract an array using both sides and conceptually "offer" it to the destination stream. `f` can maintain some internal state to control the combining process, with the initial state being specified by `s`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.make(1, 2).pipe(
 *   Stream.combineArray(
 *     Stream.make(10, 20),
 *     () => true,
 *     (useLeft, pullLeft, pullRight) =>
 *       Effect.gen(function*() {
 *         const array = useLeft ? yield* pullLeft : yield* pullRight
 *         return [array, !useLeft] as const
 *       })
 *   )
 * )
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(stream)
 *   yield* Console.log(values)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ 1, 2, 10, 20 ]
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
const exportName = "combineArray";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  'Combines the arrays (chunks) from this stream and the specified stream by repeatedly applying the function `f` to extract an array using both sides and conceptually "offer" it t...';
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.make(1, 2).pipe(\n  Stream.combineArray(\n    Stream.make(10, 20),\n    () => true,\n    (useLeft, pullLeft, pullRight) =>\n      Effect.gen(function*() {\n        const array = useLeft ? yield* pullLeft : yield* pullRight\n        return [array, !useLeft] as const\n      })\n  )\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(stream)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ 1, 2, 10, 20 ]';
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
