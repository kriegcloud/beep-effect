/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Zips this chunk pointwise with the specified chunk using the specified combiner.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const numbers = Chunk.make(1, 2, 3)
 * const letters = Chunk.make("a", "b", "c")
 * const result = Chunk.zipWith(numbers, letters, (n, l) => `${n}-${l}`)
 * console.log(Chunk.toArray(result)) // ["1-a", "2-b", "3-c"]
 * 
 * // Different lengths - takes minimum
 * const short = Chunk.make(1, 2)
 * const long = Chunk.make("a", "b", "c", "d")
 * const mixed = Chunk.zipWith(short, long, (n, l) => [n, l])
 * console.log(Chunk.toArray(mixed)) // [[1, "a"], [2, "b"]]
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Zips this chunk pointwise with the specified chunk using the specified combiner.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst numbers = Chunk.make(1, 2, 3)\nconst letters = Chunk.make(\"a\", \"b\", \"c\")\nconst result = Chunk.zipWith(numbers, letters, (n, l) => `${n}-${l}`)\nconsole.log(Chunk.toArray(result)) // [\"1-a\", \"2-b\", \"3-c\"]\n\n// Different lengths - takes minimum\nconst short = Chunk.make(1, 2)\nconst long = Chunk.make(\"a\", \"b\", \"c\", \"d\")\nconst mixed = Chunk.zipWith(short, long, (n, l) => [n, l])\nconsole.log(Chunk.toArray(mixed)) // [[1, \"a\"], [2, \"b\"]]";
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
