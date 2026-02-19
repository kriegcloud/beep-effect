/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk = Chunk.make(1, 2, 3)
 * const duplicated = Chunk.flatMap(chunk, (n) => Chunk.make(n, n))
 * console.log(Chunk.toArray(duplicated)) // [1, 1, 2, 2, 3, 3]
 * 
 * // Flattening nested arrays
 * const words = Chunk.make("hello", "world")
 * const letters = Chunk.flatMap(
 *   words,
 *   (word) => Chunk.fromIterable(word.split(""))
 * )
 * console.log(Chunk.toArray(letters)) // ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]
 * 
 * // With index parameter
 * const indexed = Chunk.flatMap(chunk, (n, i) => Chunk.make(n + i))
 * console.log(Chunk.toArray(indexed)) // [1, 3, 5]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChunkModule from "effect/Chunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3)\nconst duplicated = Chunk.flatMap(chunk, (n) => Chunk.make(n, n))\nconsole.log(Chunk.toArray(duplicated)) // [1, 1, 2, 2, 3, 3]\n\n// Flattening nested arrays\nconst words = Chunk.make(\"hello\", \"world\")\nconst letters = Chunk.flatMap(\n  words,\n  (word) => Chunk.fromIterable(word.split(\"\"))\n)\nconsole.log(Chunk.toArray(letters)) // [\"h\", \"e\", \"l\", \"l\", \"o\", \"w\", \"o\", \"r\", \"l\", \"d\"]\n\n// With index parameter\nconst indexed = Chunk.flatMap(chunk, (n, i) => Chunk.make(n + i))\nconsole.log(Chunk.toArray(indexed)) // [1, 3, 5]";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
