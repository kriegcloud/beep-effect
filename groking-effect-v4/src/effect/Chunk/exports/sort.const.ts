/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: sort
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.380Z
 *
 * Overview:
 * Sort the elements of a Chunk in increasing order, creating a new Chunk.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Order from "effect/Order"
 *
 * const numbers = Chunk.make(3, 1, 4, 1, 5, 9, 2, 6)
 * const sorted = Chunk.sort(numbers, Order.Number)
 * console.log(Chunk.toArray(sorted)) // [1, 1, 2, 3, 4, 5, 6, 9]
 *
 * // Reverse order
 * const reverseSorted = Chunk.sort(numbers, Order.flip(Order.Number))
 * console.log(Chunk.toArray(reverseSorted)) // [9, 6, 5, 4, 3, 2, 1, 1]
 *
 * // String sorting
 * const words = Chunk.make("banana", "apple", "cherry")
 * const sortedWords = Chunk.sort(words, Order.String)
 * console.log(Chunk.toArray(sortedWords)) // ["apple", "banana", "cherry"]
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
const exportName = "sort";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Sort the elements of a Chunk in increasing order, creating a new Chunk.";
const sourceExample =
  'import { Chunk } from "effect"\nimport * as Order from "effect/Order"\n\nconst numbers = Chunk.make(3, 1, 4, 1, 5, 9, 2, 6)\nconst sorted = Chunk.sort(numbers, Order.Number)\nconsole.log(Chunk.toArray(sorted)) // [1, 1, 2, 3, 4, 5, 6, 9]\n\n// Reverse order\nconst reverseSorted = Chunk.sort(numbers, Order.flip(Order.Number))\nconsole.log(Chunk.toArray(reverseSorted)) // [9, 6, 5, 4, 3, 2, 1, 1]\n\n// String sorting\nconst words = Chunk.make("banana", "apple", "cherry")\nconst sortedWords = Chunk.sort(words, Order.String)\nconsole.log(Chunk.toArray(sortedWords)) // ["apple", "banana", "cherry"]';
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
