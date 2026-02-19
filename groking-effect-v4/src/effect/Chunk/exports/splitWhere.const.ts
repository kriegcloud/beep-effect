/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: splitWhere
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.380Z
 *
 * Overview:
 * Splits this chunk on the first element that matches this predicate. Returns a tuple containing two chunks: the first one is before the match, and the second one is from the match onward.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [before, fromMatch] = Chunk.splitWhere(chunk, (n) => n > 3)
 * console.log(Chunk.toArray(before)) // [1, 2, 3]
 * console.log(Chunk.toArray(fromMatch)) // [4, 5, 6]
 *
 * // No match found
 * const [all, empty] = Chunk.splitWhere(chunk, (n) => n > 10)
 * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
 * console.log(Chunk.toArray(empty)) // []
 *
 * // Match on first element
 * const [emptyBefore, allFromFirst] = Chunk.splitWhere(chunk, (n) => n === 1)
 * console.log(Chunk.toArray(emptyBefore)) // []
 * console.log(Chunk.toArray(allFromFirst)) // [1, 2, 3, 4, 5, 6]
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
const exportName = "splitWhere";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Splits this chunk on the first element that matches this predicate. Returns a tuple containing two chunks: the first one is before the match, and the second one is from the matc...";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6)\nconst [before, fromMatch] = Chunk.splitWhere(chunk, (n) => n > 3)\nconsole.log(Chunk.toArray(before)) // [1, 2, 3]\nconsole.log(Chunk.toArray(fromMatch)) // [4, 5, 6]\n\n// No match found\nconst [all, empty] = Chunk.splitWhere(chunk, (n) => n > 10)\nconsole.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]\nconsole.log(Chunk.toArray(empty)) // []\n\n// Match on first element\nconst [emptyBefore, allFromFirst] = Chunk.splitWhere(chunk, (n) => n === 1)\nconsole.log(Chunk.toArray(emptyBefore)) // []\nconsole.log(Chunk.toArray(allFromFirst)) // [1, 2, 3, 4, 5, 6]';
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
