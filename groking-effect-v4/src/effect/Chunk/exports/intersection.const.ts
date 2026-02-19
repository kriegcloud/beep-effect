/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: intersection
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.887Z
 *
 * Overview:
 * Creates a Chunk of unique values that are included in all given Chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk1 = Chunk.make(1, 2, 3, 4)
 * const chunk2 = Chunk.make(3, 4, 5, 6)
 * const result = Chunk.intersection(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [3, 4]
 * 
 * // With strings
 * const words1 = Chunk.make("hello", "world", "foo")
 * const words2 = Chunk.make("world", "bar", "foo")
 * console.log(Chunk.toArray(Chunk.intersection(words1, words2))) // ["world", "foo"]
 * 
 * // No intersection
 * const chunk3 = Chunk.make(1, 2)
 * const chunk4 = Chunk.make(3, 4)
 * console.log(Chunk.toArray(Chunk.intersection(chunk3, chunk4))) // []
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
const exportName = "intersection";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Creates a Chunk of unique values that are included in all given Chunks.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk1 = Chunk.make(1, 2, 3, 4)\nconst chunk2 = Chunk.make(3, 4, 5, 6)\nconst result = Chunk.intersection(chunk1, chunk2)\nconsole.log(Chunk.toArray(result)) // [3, 4]\n\n// With strings\nconst words1 = Chunk.make(\"hello\", \"world\", \"foo\")\nconst words2 = Chunk.make(\"world\", \"bar\", \"foo\")\nconsole.log(Chunk.toArray(Chunk.intersection(words1, words2))) // [\"world\", \"foo\"]\n\n// No intersection\nconst chunk3 = Chunk.make(1, 2)\nconst chunk4 = Chunk.make(3, 4)\nconsole.log(Chunk.toArray(Chunk.intersection(chunk3, chunk4))) // []";
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
