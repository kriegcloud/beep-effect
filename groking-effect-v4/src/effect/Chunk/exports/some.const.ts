/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Check if a predicate holds true for some `Chunk` element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * console.log(Chunk.some(chunk, (n) => n > 4)) // true
 * console.log(Chunk.some(chunk, (n) => n > 10)) // false
 * 
 * // Empty chunk returns false
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.some(empty, (n) => n > 0)) // false
 * 
 * // Check for specific value
 * const words = Chunk.make("apple", "banana", "cherry")
 * console.log(Chunk.some(words, (word) => word.includes("ban"))) // true
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
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Check if a predicate holds true for some `Chunk` element.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconsole.log(Chunk.some(chunk, (n) => n > 4)) // true\nconsole.log(Chunk.some(chunk, (n) => n > 10)) // false\n\n// Empty chunk returns false\nconst empty = Chunk.empty<number>()\nconsole.log(Chunk.some(empty, (n) => n > 0)) // false\n\n// Check for specific value\nconst words = Chunk.make(\"apple\", \"banana\", \"cherry\")\nconsole.log(Chunk.some(words, (word) => word.includes(\"ban\"))) // true";
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
