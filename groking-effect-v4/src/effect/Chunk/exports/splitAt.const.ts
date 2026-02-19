/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: splitAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Returns two splits of this chunk at the specified index.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [before, after] = Chunk.splitAt(chunk, 3)
 * console.log(Chunk.toArray(before)) // [1, 2, 3]
 * console.log(Chunk.toArray(after)) // [4, 5, 6]
 *
 * // Split at index 0
 * const [empty, all] = Chunk.splitAt(chunk, 0)
 * console.log(Chunk.toArray(empty)) // []
 * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
 *
 * // Split beyond length
 * const [allElements, empty2] = Chunk.splitAt(chunk, 10)
 * console.log(Chunk.toArray(allElements)) // [1, 2, 3, 4, 5, 6]
 * console.log(Chunk.toArray(empty2)) // []
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
const exportName = "splitAt";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns two splits of this chunk at the specified index.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6)\nconst [before, after] = Chunk.splitAt(chunk, 3)\nconsole.log(Chunk.toArray(before)) // [1, 2, 3]\nconsole.log(Chunk.toArray(after)) // [4, 5, 6]\n\n// Split at index 0\nconst [empty, all] = Chunk.splitAt(chunk, 0)\nconsole.log(Chunk.toArray(empty)) // []\nconsole.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]\n\n// Split beyond length\nconst [allElements, empty2] = Chunk.splitAt(chunk, 10)\nconsole.log(Chunk.toArray(allElements)) // [1, 2, 3, 4, 5, 6]\nconsole.log(Chunk.toArray(empty2)) // []';
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
