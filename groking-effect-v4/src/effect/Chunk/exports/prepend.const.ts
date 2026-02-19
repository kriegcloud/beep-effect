/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: prepend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.379Z
 *
 * Overview:
 * Prepend an element to the front of a `Chunk`, creating a new `NonEmptyChunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(2, 3, 4)
 * const newChunk = Chunk.prepend(chunk, 1)
 * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
 *
 * // Prepending to empty chunk
 * const emptyChunk = Chunk.empty<string>()
 * const singleElement = Chunk.prepend(emptyChunk, "first")
 * console.log(Chunk.toArray(singleElement)) // ["first"]
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
const exportName = "prepend";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Prepend an element to the front of a `Chunk`, creating a new `NonEmptyChunk`.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(2, 3, 4)\nconst newChunk = Chunk.prepend(chunk, 1)\nconsole.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]\n\n// Prepending to empty chunk\nconst emptyChunk = Chunk.empty<string>()\nconst singleElement = Chunk.prepend(emptyChunk, "first")\nconsole.log(Chunk.toArray(singleElement)) // ["first"]';
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
