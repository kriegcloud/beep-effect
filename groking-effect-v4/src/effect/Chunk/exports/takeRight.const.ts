/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: takeRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.381Z
 *
 * Overview:
 * Takes the last `n` elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const lastThree = Chunk.takeRight(chunk, 3)
 * console.log(Chunk.toArray(lastThree)) // [4, 5, 6]
 *
 * // Take more than available
 * const all = Chunk.takeRight(chunk, 10)
 * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
 *
 * // Take zero
 * const none = Chunk.takeRight(chunk, 0)
 * console.log(Chunk.toArray(none)) // []
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
const exportName = "takeRight";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Takes the last `n` elements.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6)\nconst lastThree = Chunk.takeRight(chunk, 3)\nconsole.log(Chunk.toArray(lastThree)) // [4, 5, 6]\n\n// Take more than available\nconst all = Chunk.takeRight(chunk, 10)\nconsole.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]\n\n// Take zero\nconst none = Chunk.takeRight(chunk, 0)\nconsole.log(Chunk.toArray(none)) // []';
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
