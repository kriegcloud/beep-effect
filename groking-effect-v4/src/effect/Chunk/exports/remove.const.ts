/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Delete the element at the specified index, creating a new `Chunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("a", "b", "c", "d")
 * const result = Chunk.remove(chunk, 1)
 * console.log(Chunk.toArray(result)) // ["a", "c", "d"]
 *
 * // Remove first element
 * const removeFirst = Chunk.remove(chunk, 0)
 * console.log(Chunk.toArray(removeFirst)) // ["b", "c", "d"]
 *
 * // Index out of bounds returns same chunk
 * const outOfBounds = Chunk.remove(chunk, 10)
 * console.log(Chunk.toArray(outOfBounds)) // ["a", "b", "c", "d"]
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
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Delete the element at the specified index, creating a new `Chunk`.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make("a", "b", "c", "d")\nconst result = Chunk.remove(chunk, 1)\nconsole.log(Chunk.toArray(result)) // ["a", "c", "d"]\n\n// Remove first element\nconst removeFirst = Chunk.remove(chunk, 0)\nconsole.log(Chunk.toArray(removeFirst)) // ["b", "c", "d"]\n\n// Index out of bounds returns same chunk\nconst outOfBounds = Chunk.remove(chunk, 10)\nconsole.log(Chunk.toArray(outOfBounds)) // ["a", "b", "c", "d"]';
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
