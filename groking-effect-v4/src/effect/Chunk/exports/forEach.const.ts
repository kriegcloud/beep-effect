/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: forEach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.378Z
 *
 * Overview:
 * Iterates over each element of a `Chunk` and applies a function to it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 *
 * // Log each element
 * Chunk.forEach(chunk, (n) => console.log(`Value: ${n}`))
 * // Output:
 * // Value: 1
 * // Value: 2
 * // Value: 3
 * // Value: 4
 *
 * // With index parameter
 * Chunk.forEach(chunk, (n, i) => console.log(`Index ${i}: ${n}`))
 * // Output:
 * // Index 0: 1
 * // Index 1: 2
 * // Index 2: 3
 * // Index 3: 4
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
const exportName = "forEach";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Iterates over each element of a `Chunk` and applies a function to it.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4)\n\n// Log each element\nChunk.forEach(chunk, (n) => console.log(`Value: ${n}`))\n// Output:\n// Value: 1\n// Value: 2\n// Value: 3\n// Value: 4\n\n// With index parameter\nChunk.forEach(chunk, (n, i) => console.log(`Index ${i}: ${n}`))\n// Output:\n// Index 0: 1\n// Index 1: 2\n// Index 2: 3\n// Index 3: 4';
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
