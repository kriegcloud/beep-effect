/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.483Z
 *
 * Overview:
 * Zips two streams point-wise with a combining function, ending when either stream ends.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream1 = Stream.make(1, 2, 3, 4, 5, 6)
 * const stream2 = Stream.make("a", "b", "c")
 *
 * const zipped = Stream.zipWith(stream1, stream2, (n, s) => `${n}-${s}`)
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(zipped)
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ "1-a", "2-b", "3-c" ]
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Zips two streams point-wise with a combining function, ending when either stream ends.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream1 = Stream.make(1, 2, 3, 4, 5, 6)\nconst stream2 = Stream.make("a", "b", "c")\n\nconst zipped = Stream.zipWith(stream1, stream2, (n, s) => `${n}-${s}`)\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.runCollect(zipped)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [ "1-a", "2-b", "3-c" ]';
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
