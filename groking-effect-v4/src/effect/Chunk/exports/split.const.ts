/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: split
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.380Z
 *
 * Overview:
 * Splits this chunk into `n` equally sized chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
 * const chunks = Chunk.split(chunk, 3)
 * console.log(Chunk.toArray(chunks).map(Chunk.toArray))
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * // Uneven split
 * const chunk2 = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8)
 * const chunks2 = Chunk.split(chunk2, 3)
 * console.log(Chunk.toArray(chunks2).map(Chunk.toArray))
 * // [[1, 2, 3], [4, 5, 6], [7, 8]]
 *
 * // Split into 1 chunk
 * const chunks3 = Chunk.split(chunk, 1)
 * console.log(Chunk.toArray(chunks3).map(Chunk.toArray))
 * // [[1, 2, 3, 4, 5, 6, 7, 8, 9]]
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
const exportName = "split";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Splits this chunk into `n` equally sized chunks.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)\nconst chunks = Chunk.split(chunk, 3)\nconsole.log(Chunk.toArray(chunks).map(Chunk.toArray))\n// [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n\n// Uneven split\nconst chunk2 = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8)\nconst chunks2 = Chunk.split(chunk2, 3)\nconsole.log(Chunk.toArray(chunks2).map(Chunk.toArray))\n// [[1, 2, 3], [4, 5, 6], [7, 8]]\n\n// Split into 1 chunk\nconst chunks3 = Chunk.split(chunk, 1)\nconsole.log(Chunk.toArray(chunks3).map(Chunk.toArray))\n// [[1, 2, 3, 4, 5, 6, 7, 8, 9]]';
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
