/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: tailNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Returns every elements after the first.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4)
 * const result = Chunk.tailNonEmpty(nonEmptyChunk)
 * console.log(Chunk.toArray(result)) // [2, 3, 4]
 *
 * const singleElement = Chunk.make(1)
 * const resultSingle = Chunk.tailNonEmpty(singleElement)
 * console.log(Chunk.toArray(resultSingle)) // []
 *
 * // Type safety: this function only accepts NonEmptyChunk
 * // Chunk.tailNonEmpty(Chunk.empty()) // TypeScript error
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
const exportName = "tailNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns every elements after the first.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst nonEmptyChunk = Chunk.make(1, 2, 3, 4)\nconst result = Chunk.tailNonEmpty(nonEmptyChunk)\nconsole.log(Chunk.toArray(result)) // [2, 3, 4]\n\nconst singleElement = Chunk.make(1)\nconst resultSingle = Chunk.tailNonEmpty(singleElement)\nconsole.log(Chunk.toArray(resultSingle)) // []\n\n// Type safety: this function only accepts NonEmptyChunk\n// Chunk.tailNonEmpty(Chunk.empty()) // TypeScript error';
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
