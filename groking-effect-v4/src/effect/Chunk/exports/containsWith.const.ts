/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: containsWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.377Z
 *
 * Overview:
 * Returns a function that checks if a `Chunk` contains a given value using a provided `isEquivalent` function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })
 *
 * // Custom equivalence by id
 * const containsById = Chunk.containsWith<{ id: number; name: string }>((a, b) =>
 *   a.id === b.id
 * )
 * console.log(containsById(chunk, { id: 1, name: "Different" })) // true
 * console.log(containsById(chunk, { id: 3, name: "Charlie" })) // false
 *
 * // Case-insensitive string comparison
 * const words = Chunk.make("Apple", "Banana", "Cherry")
 * const containsCaseInsensitive = Chunk.containsWith<string>((a, b) =>
 *   a.toLowerCase() === b.toLowerCase()
 * )
 * console.log(containsCaseInsensitive(words, "apple")) // true
 * console.log(containsCaseInsensitive(words, "grape")) // false
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
const exportName = "containsWith";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Returns a function that checks if a `Chunk` contains a given value using a provided `isEquivalent` function.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })\n\n// Custom equivalence by id\nconst containsById = Chunk.containsWith<{ id: number; name: string }>((a, b) =>\n  a.id === b.id\n)\nconsole.log(containsById(chunk, { id: 1, name: "Different" })) // true\nconsole.log(containsById(chunk, { id: 3, name: "Charlie" })) // false\n\n// Case-insensitive string comparison\nconst words = Chunk.make("Apple", "Banana", "Cherry")\nconst containsCaseInsensitive = Chunk.containsWith<string>((a, b) =>\n  a.toLowerCase() === b.toLowerCase()\n)\nconsole.log(containsCaseInsensitive(words, "apple")) // true\nconsole.log(containsCaseInsensitive(words, "grape")) // false';
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
