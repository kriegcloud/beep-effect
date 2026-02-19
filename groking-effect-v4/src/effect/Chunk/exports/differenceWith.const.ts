/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: differenceWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Creates a `Chunk` of values not included in the other given `Chunk` using the provided `isEquivalent` function. The order and references of result values are determined by the first `Chunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })
 * const chunk2 = Chunk.make({ id: 1, name: "Alice" }, { id: 3, name: "Charlie" })
 *
 * // Custom equivalence by id
 * const byId = Chunk.differenceWith<{ id: number; name: string }>((a, b) =>
 *   a.id === b.id
 * )
 * const result = byId(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [{ id: 2, name: "Bob" }]
 *
 * // String comparison case-insensitive
 * const words1 = Chunk.make("Apple", "Banana", "Cherry")
 * const words2 = Chunk.make("apple", "grape")
 * const caseInsensitive = Chunk.differenceWith<string>((a, b) =>
 *   a.toLowerCase() === b.toLowerCase()
 * )
 * const wordDiff = caseInsensitive(words1, words2)
 * console.log(Chunk.toArray(wordDiff)) // ["Banana", "Cherry"]
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
const exportName = "differenceWith";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "Creates a `Chunk` of values not included in the other given `Chunk` using the provided `isEquivalent` function. The order and references of result values are determined by the f...";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk1 = Chunk.make({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })\nconst chunk2 = Chunk.make({ id: 1, name: "Alice" }, { id: 3, name: "Charlie" })\n\n// Custom equivalence by id\nconst byId = Chunk.differenceWith<{ id: number; name: string }>((a, b) =>\n  a.id === b.id\n)\nconst result = byId(chunk1, chunk2)\nconsole.log(Chunk.toArray(result)) // [{ id: 2, name: "Bob" }]\n\n// String comparison case-insensitive\nconst words1 = Chunk.make("Apple", "Banana", "Cherry")\nconst words2 = Chunk.make("apple", "grape")\nconst caseInsensitive = Chunk.differenceWith<string>((a, b) =>\n  a.toLowerCase() === b.toLowerCase()\n)\nconst wordDiff = caseInsensitive(words1, words2)\nconsole.log(Chunk.toArray(wordDiff)) // ["Banana", "Cherry"]';
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
