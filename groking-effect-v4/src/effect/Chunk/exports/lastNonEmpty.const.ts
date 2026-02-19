/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: lastNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.887Z
 *
 * Overview:
 * Returns the last element of this non empty chunk.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.lastNonEmpty(nonEmptyChunk)) // 4
 * 
 * const singleElement = Chunk.make("hello")
 * console.log(Chunk.lastNonEmpty(singleElement)) // "hello"
 * 
 * // Type safety: this function only accepts NonEmptyChunk
 * // Chunk.lastNonEmpty(Chunk.empty()) // TypeScript error
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
const exportName = "lastNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns the last element of this non empty chunk.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst nonEmptyChunk = Chunk.make(1, 2, 3, 4)\nconsole.log(Chunk.lastNonEmpty(nonEmptyChunk)) // 4\n\nconst singleElement = Chunk.make(\"hello\")\nconsole.log(Chunk.lastNonEmpty(singleElement)) // \"hello\"\n\n// Type safety: this function only accepts NonEmptyChunk\n// Chunk.lastNonEmpty(Chunk.empty()) // TypeScript error";
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
