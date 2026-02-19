/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: flatten
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.378Z
 *
 * Overview:
 * Flattens a chunk of chunks into a single chunk by concatenating all chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nested = Chunk.make(
 *   Chunk.make(1, 2),
 *   Chunk.make(3, 4, 5),
 *   Chunk.make(6)
 * )
 * const flattened = Chunk.flatten(nested)
 * console.log(Chunk.toArray(flattened)) // [1, 2, 3, 4, 5, 6]
 *
 * // With empty chunks
 * const withEmpty = Chunk.make(
 *   Chunk.make(1, 2),
 *   Chunk.empty<number>(),
 *   Chunk.make(3, 4)
 * )
 * console.log(Chunk.toArray(Chunk.flatten(withEmpty))) // [1, 2, 3, 4]
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
const exportName = "flatten";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Flattens a chunk of chunks into a single chunk by concatenating all chunks.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst nested = Chunk.make(\n  Chunk.make(1, 2),\n  Chunk.make(3, 4, 5),\n  Chunk.make(6)\n)\nconst flattened = Chunk.flatten(nested)\nconsole.log(Chunk.toArray(flattened)) // [1, 2, 3, 4, 5, 6]\n\n// With empty chunks\nconst withEmpty = Chunk.make(\n  Chunk.make(1, 2),\n  Chunk.empty<number>(),\n  Chunk.make(3, 4)\n)\nconsole.log(Chunk.toArray(Chunk.flatten(withEmpty))) // [1, 2, 3, 4]';
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
