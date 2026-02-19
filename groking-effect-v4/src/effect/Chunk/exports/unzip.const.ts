/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: unzip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.381Z
 *
 * Overview:
 * Takes a `Chunk` of pairs and return two corresponding `Chunk`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const pairs = Chunk.make(
 *   [1, "a"] as const,
 *   [2, "b"] as const,
 *   [3, "c"] as const
 * )
 * const [numbers, letters] = Chunk.unzip(pairs)
 * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
 * console.log(Chunk.toArray(letters)) // ["a", "b", "c"]
 *
 * // Empty chunk
 * const empty = Chunk.empty<[number, string]>()
 * const [emptyNums, emptyStrs] = Chunk.unzip(empty)
 * console.log(Chunk.toArray(emptyNums)) // []
 * console.log(Chunk.toArray(emptyStrs)) // []
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
const exportName = "unzip";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Takes a `Chunk` of pairs and return two corresponding `Chunk`s.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst pairs = Chunk.make(\n  [1, "a"] as const,\n  [2, "b"] as const,\n  [3, "c"] as const\n)\nconst [numbers, letters] = Chunk.unzip(pairs)\nconsole.log(Chunk.toArray(numbers)) // [1, 2, 3]\nconsole.log(Chunk.toArray(letters)) // ["a", "b", "c"]\n\n// Empty chunk\nconst empty = Chunk.empty<[number, string]>()\nconst [emptyNums, emptyStrs] = Chunk.unzip(empty)\nconsole.log(Chunk.toArray(emptyNums)) // []\nconsole.log(Chunk.toArray(emptyStrs)) // []';
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
