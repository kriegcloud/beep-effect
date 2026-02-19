/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Reduces the elements of a chunk from left to right.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const sum = Chunk.reduce(chunk, 0, (acc, n) => acc + n)
 * console.log(sum) // 15
 *
 * // String concatenation with index
 * const words = Chunk.make("a", "b", "c")
 * const result = Chunk.reduce(words, "", (acc, word, i) => acc + `${i}:${word} `)
 * console.log(result) // "0:a 1:b 2:c "
 *
 * // Find maximum
 * const max = Chunk.reduce(chunk, -Infinity, (acc, n) => Math.max(acc, n))
 * console.log(max) // 5
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
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Reduces the elements of a chunk from left to right.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconst sum = Chunk.reduce(chunk, 0, (acc, n) => acc + n)\nconsole.log(sum) // 15\n\n// String concatenation with index\nconst words = Chunk.make("a", "b", "c")\nconst result = Chunk.reduce(words, "", (acc, word, i) => acc + `${i}:${word} `)\nconsole.log(result) // "0:a 1:b 2:c "\n\n// Find maximum\nconst max = Chunk.reduce(chunk, -Infinity, (acc, n) => Math.max(acc, n))\nconsole.log(max) // 5';
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
