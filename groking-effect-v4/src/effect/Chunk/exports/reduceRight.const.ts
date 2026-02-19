/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: reduceRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.380Z
 *
 * Overview:
 * Reduces the elements of a chunk from right to left.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * const result = Chunk.reduceRight(chunk, 0, (acc, n) => acc + n)
 * console.log(result) // 10
 *
 * // String building (right to left)
 * const words = Chunk.make("a", "b", "c")
 * const reversed = Chunk.reduceRight(
 *   words,
 *   "",
 *   (acc, word, i) => acc + `${i}:${word} `
 * )
 * console.log(reversed) // "2:c 1:b 0:a "
 *
 * // Subtract from right to left
 * const subtraction = Chunk.reduceRight(chunk, 0, (acc, n) => n - acc)
 * console.log(subtraction) // -2 (4 - (3 - (2 - (1 - 0))))
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
const exportName = "reduceRight";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Reduces the elements of a chunk from right to left.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4)\nconst result = Chunk.reduceRight(chunk, 0, (acc, n) => acc + n)\nconsole.log(result) // 10\n\n// String building (right to left)\nconst words = Chunk.make("a", "b", "c")\nconst reversed = Chunk.reduceRight(\n  words,\n  "",\n  (acc, word, i) => acc + `${i}:${word} `\n)\nconsole.log(reversed) // "2:c 1:b 0:a "\n\n// Subtract from right to left\nconst subtraction = Chunk.reduceRight(chunk, 0, (acc, n) => n - acc)\nconsole.log(subtraction) // -2 (4 - (3 - (2 - (1 - 0))))';
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
