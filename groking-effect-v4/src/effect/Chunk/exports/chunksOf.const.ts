/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: chunksOf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.885Z
 *
 * Overview:
 * Groups elements in chunks of up to `n` elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
 * const chunked = Chunk.chunksOf(chunk, 3)
 *
 * console.log(Chunk.toArray(chunked).map(Chunk.toArray))
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * // When length is not evenly divisible
 * const chunk2 = Chunk.make(1, 2, 3, 4, 5)
 * const chunked2 = Chunk.chunksOf(chunk2, 2)
 * console.log(Chunk.toArray(chunked2).map(Chunk.toArray))
 * // [[1, 2], [3, 4], [5]]
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
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "chunksOf";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Groups elements in chunks of up to `n` elements.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)\nconst chunked = Chunk.chunksOf(chunk, 3)\n\nconsole.log(Chunk.toArray(chunked).map(Chunk.toArray))\n// [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n\n// When length is not evenly divisible\nconst chunk2 = Chunk.make(1, 2, 3, 4, 5)\nconst chunked2 = Chunk.chunksOf(chunk2, 2)\nconsole.log(Chunk.toArray(chunked2).map(Chunk.toArray))\n// [[1, 2], [3, 4], [5]]';
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
