/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: zipWithArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.446Z
 *
 * Overview:
 * Zips two streams by applying a function to non-empty arrays of elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Console, Effect, Stream } from "effect"
 *
 * const left = Stream.fromArrays([1, 2, 3], [4, 5])
 * const right = Stream.fromArrays(["a", "b"], ["c", "d", "e"])
 *
 * const zipped = Stream.zipWithArray(left, right, (leftChunk, rightChunk) => {
 *   const minLength = Math.min(leftChunk.length, rightChunk.length)
 *   const output = Array.makeBy(minLength, (i) => [leftChunk[i], rightChunk[i]] as const)
 *
 *   return [output, leftChunk.slice(minLength), rightChunk.slice(minLength)]
 * })
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(zipped)
 *   yield* Console.log(result)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [[1, "a"], [2, "b"], [3, "c"], [4, "d"], [5, "e"]]
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
const exportName = "zipWithArray";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Zips two streams by applying a function to non-empty arrays of elements.";
const sourceExample =
  'import { Array, Console, Effect, Stream } from "effect"\n\nconst left = Stream.fromArrays([1, 2, 3], [4, 5])\nconst right = Stream.fromArrays(["a", "b"], ["c", "d", "e"])\n\nconst zipped = Stream.zipWithArray(left, right, (leftChunk, rightChunk) => {\n  const minLength = Math.min(leftChunk.length, rightChunk.length)\n  const output = Array.makeBy(minLength, (i) => [leftChunk[i], rightChunk[i]] as const)\n\n  return [output, leftChunk.slice(minLength), rightChunk.slice(minLength)]\n})\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.runCollect(zipped)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [[1, "a"], [2, "b"], [3, "c"], [4, "d"], [5, "e"]]';
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
