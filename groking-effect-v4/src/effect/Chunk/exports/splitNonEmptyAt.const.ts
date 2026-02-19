/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: splitNonEmptyAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Splits a `NonEmptyChunk` into two segments, with the first segment containing a maximum of `n` elements. The value of `n` must be `>= 1`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [before, after] = Chunk.splitNonEmptyAt(nonEmptyChunk, 3)
 * console.log(Chunk.toArray(before)) // [1, 2, 3]
 * console.log(Chunk.toArray(after)) // [4, 5, 6]
 *
 * // Split at 1 (minimum)
 * const [first, rest] = Chunk.splitNonEmptyAt(nonEmptyChunk, 1)
 * console.log(Chunk.toArray(first)) // [1]
 * console.log(Chunk.toArray(rest)) // [2, 3, 4, 5, 6]
 *
 * // The first part is guaranteed to be NonEmptyChunk
 * // while the second part may be empty
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
const exportName = "splitNonEmptyAt";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Splits a `NonEmptyChunk` into two segments, with the first segment containing a maximum of `n` elements. The value of `n` must be `>= 1`.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst nonEmptyChunk = Chunk.make(1, 2, 3, 4, 5, 6)\nconst [before, after] = Chunk.splitNonEmptyAt(nonEmptyChunk, 3)\nconsole.log(Chunk.toArray(before)) // [1, 2, 3]\nconsole.log(Chunk.toArray(after)) // [4, 5, 6]\n\n// Split at 1 (minimum)\nconst [first, rest] = Chunk.splitNonEmptyAt(nonEmptyChunk, 1)\nconsole.log(Chunk.toArray(first)) // [1]\nconsole.log(Chunk.toArray(rest)) // [2, 3, 4, 5, 6]\n\n// The first part is guaranteed to be NonEmptyChunk\n// while the second part may be empty';
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
