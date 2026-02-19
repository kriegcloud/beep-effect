/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: toArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.381Z
 *
 * Overview:
 * Converts a `Chunk` into an `Array`. If the provided `Chunk` is non-empty (`NonEmptyChunk`), the function will return a `NonEmptyArray`, ensuring the non-empty property is preserved.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const array = Chunk.toArray(chunk)
 * console.log(array) // [1, 2, 3]
 * console.log(Array.isArray(array)) // true
 *
 * // With empty chunk
 * const emptyChunk = Chunk.empty<number>()
 * console.log(Chunk.toArray(emptyChunk)) // []
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
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toArray";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Converts a `Chunk` into an `Array`. If the provided `Chunk` is non-empty (`NonEmptyChunk`), the function will return a `NonEmptyArray`, ensuring the non-empty property is preser...";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3)\nconst array = Chunk.toArray(chunk)\nconsole.log(array) // [1, 2, 3]\nconsole.log(Array.isArray(array)) // true\n\n// With empty chunk\nconst emptyChunk = Chunk.empty<number>()\nconsole.log(Chunk.toArray(emptyChunk)) // []';
const moduleRecord = ChunkModule as Record<string, unknown>;

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
