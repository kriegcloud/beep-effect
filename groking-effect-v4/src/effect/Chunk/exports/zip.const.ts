/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: zip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.381Z
 *
 * Overview:
 * Zips this chunk pointwise with the specified chunk.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const numbers = Chunk.make(1, 2, 3)
 * const letters = Chunk.make("a", "b", "c")
 * const result = Chunk.zip(numbers, letters)
 * console.log(Chunk.toArray(result)) // [[1, "a"], [2, "b"], [3, "c"]]
 *
 * // Different lengths - takes minimum length
 * const short = Chunk.make(1, 2)
 * const long = Chunk.make("a", "b", "c", "d")
 * const zipped = Chunk.zip(short, long)
 * console.log(Chunk.toArray(zipped)) // [[1, "a"], [2, "b"]]
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
const exportName = "zip";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Zips this chunk pointwise with the specified chunk.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst numbers = Chunk.make(1, 2, 3)\nconst letters = Chunk.make("a", "b", "c")\nconst result = Chunk.zip(numbers, letters)\nconsole.log(Chunk.toArray(result)) // [[1, "a"], [2, "b"], [3, "c"]]\n\n// Different lengths - takes minimum length\nconst short = Chunk.make(1, 2)\nconst long = Chunk.make("a", "b", "c", "d")\nconst zipped = Chunk.zip(short, long)\nconsole.log(Chunk.toArray(zipped)) // [[1, "a"], [2, "b"]]';
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
