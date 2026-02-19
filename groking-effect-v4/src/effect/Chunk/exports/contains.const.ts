/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: contains
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.885Z
 *
 * Overview:
 * Returns a function that checks if a `Chunk` contains a given value using the default `Equivalence`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * console.log(Chunk.contains(chunk, 3)) // true
 * console.log(Chunk.contains(chunk, 6)) // false
 *
 * // Works with strings
 * const words = Chunk.make("apple", "banana", "cherry")
 * console.log(Chunk.contains(words, "banana")) // true
 * console.log(Chunk.contains(words, "grape")) // false
 *
 * // Empty chunk
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.contains(empty, 1)) // false
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
const exportName = "contains";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Returns a function that checks if a `Chunk` contains a given value using the default `Equivalence`.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconsole.log(Chunk.contains(chunk, 3)) // true\nconsole.log(Chunk.contains(chunk, 6)) // false\n\n// Works with strings\nconst words = Chunk.make("apple", "banana", "cherry")\nconsole.log(Chunk.contains(words, "banana")) // true\nconsole.log(Chunk.contains(words, "grape")) // false\n\n// Empty chunk\nconst empty = Chunk.empty<number>()\nconsole.log(Chunk.contains(empty, 1)) // false';
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
