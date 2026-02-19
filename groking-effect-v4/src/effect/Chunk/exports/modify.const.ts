/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.379Z
 *
 * Overview:
 * Applies a function to the element at the specified index, creating a new `Chunk`, or returns `None` if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * const result = Chunk.modify(chunk, 1, (n) => n * 10)
 * console.log(result) // { _id: 'Chunk', values: [ 1, 20, 3, 4 ] }
 *
 * // Index out of bounds returns None
 * const outOfBounds = chunk?.pipe(Chunk.modify(10, (n) => n * 10))
 * console.log(outOfBounds === undefined) // true
 *
 * // Negative index returns None
 * const negative = chunk?.pipe(Chunk.modify(-1, (n) => n * 10))
 * console.log(negative === undefined) // true
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
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Applies a function to the element at the specified index, creating a new `Chunk`, or returns `None` if the index is out of bounds.";
const sourceExample =
  "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3, 4)\nconst result = Chunk.modify(chunk, 1, (n) => n * 10)\nconsole.log(result) // { _id: 'Chunk', values: [ 1, 20, 3, 4 ] }\n\n// Index out of bounds returns None\nconst outOfBounds = chunk?.pipe(Chunk.modify(10, (n) => n * 10))\nconsole.log(outOfBounds === undefined) // true\n\n// Negative index returns None\nconst negative = chunk?.pipe(Chunk.modify(-1, (n) => n * 10))\nconsole.log(negative === undefined) // true";
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
