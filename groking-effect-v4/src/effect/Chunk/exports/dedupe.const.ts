/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: dedupe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.377Z
 *
 * Overview:
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 2, 3, 1, 4, 3)
 * const result = Chunk.dedupe(chunk)
 * console.log(Chunk.toArray(result)) // [1, 2, 3, 4]
 *
 * // Empty chunk
 * const empty = Chunk.empty<number>()
 * const emptyDeduped = Chunk.dedupe(empty)
 * console.log(Chunk.toArray(emptyDeduped)) // []
 *
 * // No duplicates
 * const unique = Chunk.make(1, 2, 3)
 * const uniqueDeduped = Chunk.dedupe(unique)
 * console.log(Chunk.toArray(uniqueDeduped)) // [1, 2, 3]
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
const exportName = "dedupe";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Remove duplicates from an array, keeping the first occurrence of an element.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 2, 3, 1, 4, 3)\nconst result = Chunk.dedupe(chunk)\nconsole.log(Chunk.toArray(result)) // [1, 2, 3, 4]\n\n// Empty chunk\nconst empty = Chunk.empty<number>()\nconst emptyDeduped = Chunk.dedupe(empty)\nconsole.log(Chunk.toArray(emptyDeduped)) // []\n\n// No duplicates\nconst unique = Chunk.make(1, 2, 3)\nconst uniqueDeduped = Chunk.dedupe(unique)\nconsole.log(Chunk.toArray(uniqueDeduped)) // [1, 2, 3]';
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
