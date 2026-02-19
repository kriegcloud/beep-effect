/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: union
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Creates a Chunks of unique values, in order, from all given Chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make(1, 2, 3)
 * const chunk2 = Chunk.make(3, 4, 5)
 * const result = Chunk.union(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [1, 2, 3, 4, 5]
 *
 * // Handles duplicates within the same chunk
 * const withDupes1 = Chunk.make(1, 1, 2)
 * const withDupes2 = Chunk.make(2, 3, 3)
 * const unified = Chunk.union(withDupes1, withDupes2)
 * console.log(Chunk.toArray(unified)) // [1, 2, 3]
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
const exportName = "union";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Creates a Chunks of unique values, in order, from all given Chunks.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk1 = Chunk.make(1, 2, 3)\nconst chunk2 = Chunk.make(3, 4, 5)\nconst result = Chunk.union(chunk1, chunk2)\nconsole.log(Chunk.toArray(result)) // [1, 2, 3, 4, 5]\n\n// Handles duplicates within the same chunk\nconst withDupes1 = Chunk.make(1, 1, 2)\nconst withDupes2 = Chunk.make(2, 3, 3)\nconst unified = Chunk.union(withDupes1, withDupes2)\nconsole.log(Chunk.toArray(unified)) // [1, 2, 3]';
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
