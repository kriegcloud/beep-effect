/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: partition
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Separate elements based on a predicate that also exposes the index of the element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [odds, evens] = Chunk.partition(chunk, (n) => n % 2 === 0)
 * console.log(Chunk.toArray(odds)) // [1, 3, 5]
 * console.log(Chunk.toArray(evens)) // [2, 4, 6]
 *
 * // With index parameter
 * const words = Chunk.make("a", "bb", "ccc", "dddd")
 * const [short, long] = Chunk.partition(words, (word, i) => word.length > i)
 * console.log(Chunk.toArray(short)) // ["a", "bb"]
 * console.log(Chunk.toArray(long)) // ["ccc", "dddd"]
 *
 * // With refinement
 * const mixed = Chunk.make("hello", 42, "world", 100)
 * const [strings, numbers] = Chunk.partition(
 *   mixed,
 *   (x): x is number => typeof x === "number"
 * )
 * console.log(Chunk.toArray(strings)) // ["hello", "world"]
 * console.log(Chunk.toArray(numbers)) // [42, 100]
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
const exportName = "partition";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Separate elements based on a predicate that also exposes the index of the element.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6)\nconst [odds, evens] = Chunk.partition(chunk, (n) => n % 2 === 0)\nconsole.log(Chunk.toArray(odds)) // [1, 3, 5]\nconsole.log(Chunk.toArray(evens)) // [2, 4, 6]\n\n// With index parameter\nconst words = Chunk.make("a", "bb", "ccc", "dddd")\nconst [short, long] = Chunk.partition(words, (word, i) => word.length > i)\nconsole.log(Chunk.toArray(short)) // ["a", "bb"]\nconsole.log(Chunk.toArray(long)) // ["ccc", "dddd"]\n\n// With refinement\nconst mixed = Chunk.make("hello", 42, "world", 100)\nconst [strings, numbers] = Chunk.partition(\n  mixed,\n  (x): x is number => typeof x === "number"\n)\nconsole.log(Chunk.toArray(strings)) // ["hello", "world"]\nconsole.log(Chunk.toArray(numbers)) // [42, 100]';
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
