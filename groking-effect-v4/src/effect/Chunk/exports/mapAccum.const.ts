/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: mapAccum
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Statefully maps over the chunk, producing new elements of type `B`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const [finalState, mapped] = Chunk.mapAccum(chunk, 0, (state, current) => [
 *   state + current, // accumulate sum
 *   state + current // output running sum
 * ])
 * 
 * console.log(finalState) // 15 (final accumulated sum)
 * console.log(Chunk.toArray(mapped)) // [1, 3, 6, 10, 15] (running sums)
 * 
 * // Building a string with indices
 * const words = Chunk.make("hello", "world", "effect")
 * const [count, indexed] = Chunk.mapAccum(words, 0, (index, word) => [
 *   index + 1,
 *   `${index}: ${word}`
 * ])
 * console.log(count) // 3
 * console.log(Chunk.toArray(indexed)) // ["0: hello", "1: world", "2: effect"]
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
const exportName = "mapAccum";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Statefully maps over the chunk, producing new elements of type `B`.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconst [finalState, mapped] = Chunk.mapAccum(chunk, 0, (state, current) => [\n  state + current, // accumulate sum\n  state + current // output running sum\n])\n\nconsole.log(finalState) // 15 (final accumulated sum)\nconsole.log(Chunk.toArray(mapped)) // [1, 3, 6, 10, 15] (running sums)\n\n// Building a string with indices\nconst words = Chunk.make(\"hello\", \"world\", \"effect\")\nconst [count, indexed] = Chunk.mapAccum(words, 0, (index, word) => [\n  index + 1,\n  `${index}: ${word}`\n])\nconsole.log(count) // 3\nconsole.log(Chunk.toArray(indexed)) // [\"0: hello\", \"1: world\", \"2: effect\"]";
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
