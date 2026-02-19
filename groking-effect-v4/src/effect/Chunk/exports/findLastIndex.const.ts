/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: findLastIndex
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.378Z
 *
 * Overview:
 * Return the last index for which a predicate holds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findLastIndex(chunk, (n) => n < 4)
 * console.log(result) // 2
 *
 * // No match found
 * const notFound = Chunk.findLastIndex(chunk, (n) => n > 10)
 * console.log(notFound) // undefined
 *
 * // Find last even number index
 * const lastEven = Chunk.findLastIndex(chunk, (n) => n % 2 === 0)
 * console.log(lastEven) // 3
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
const exportName = "findLastIndex";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Return the last index for which a predicate holds.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconst result = Chunk.findLastIndex(chunk, (n) => n < 4)\nconsole.log(result) // 2\n\n// No match found\nconst notFound = Chunk.findLastIndex(chunk, (n) => n > 10)\nconsole.log(notFound) // undefined\n\n// Find last even number index\nconst lastEven = Chunk.findLastIndex(chunk, (n) => n % 2 === 0)\nconsole.log(lastEven) // 3';
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
