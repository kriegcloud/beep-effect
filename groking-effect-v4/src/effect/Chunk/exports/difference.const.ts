/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: difference
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Creates a `Chunk` of values not included in the other given `Chunk`. The order and references of result values are determined by the first `Chunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make(1, 2, 3, 4, 5)
 * const chunk2 = Chunk.make(3, 4, 6, 7)
 * const result = Chunk.difference(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [1, 2, 5]
 *
 * // String difference
 * const words1 = Chunk.make("apple", "banana", "cherry")
 * const words2 = Chunk.make("banana", "grape")
 * const wordDiff = Chunk.difference(words1, words2)
 * console.log(Chunk.toArray(wordDiff)) // ["apple", "cherry"]
 *
 * // Empty second chunk returns original
 * const empty = Chunk.empty<number>()
 * const unchanged = Chunk.difference(chunk1, empty)
 * console.log(Chunk.toArray(unchanged)) // [1, 2, 3, 4, 5]
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
const exportName = "difference";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Creates a `Chunk` of values not included in the other given `Chunk`. The order and references of result values are determined by the first `Chunk`.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk1 = Chunk.make(1, 2, 3, 4, 5)\nconst chunk2 = Chunk.make(3, 4, 6, 7)\nconst result = Chunk.difference(chunk1, chunk2)\nconsole.log(Chunk.toArray(result)) // [1, 2, 5]\n\n// String difference\nconst words1 = Chunk.make("apple", "banana", "cherry")\nconst words2 = Chunk.make("banana", "grape")\nconst wordDiff = Chunk.difference(words1, words2)\nconsole.log(Chunk.toArray(wordDiff)) // ["apple", "cherry"]\n\n// Empty second chunk returns original\nconst empty = Chunk.empty<number>()\nconst unchanged = Chunk.difference(chunk1, empty)\nconsole.log(Chunk.toArray(unchanged)) // [1, 2, 3, 4, 5]';
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
