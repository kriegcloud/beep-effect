/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: sortWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Sorts the elements of a Chunk based on a projection function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Order from "effect/Order"
 * 
 * const people = Chunk.make(
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 },
 *   { name: "Charlie", age: 35 }
 * )
 * 
 * // Sort by age
 * const byAge = Chunk.sortWith(people, (person) => person.age, Order.Number)
 * console.log(Chunk.toArray(byAge))
 * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 35 }]
 * 
 * // Sort by name
 * const byName = Chunk.sortWith(people, (person) => person.name, Order.String)
 * console.log(Chunk.toArray(byName))
 * // [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }, { name: "Charlie", age: 35 }]
 * 
 * // Sort by string length
 * const words = Chunk.make("a", "abc", "ab")
 * const byLength = Chunk.sortWith(words, (word) => word.length, Order.Number)
 * console.log(Chunk.toArray(byLength)) // ["a", "ab", "abc"]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChunkModule from "effect/Chunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "sortWith";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Sorts the elements of a Chunk based on a projection function.";
const sourceExample = "import { Chunk } from \"effect\"\nimport * as Order from \"effect/Order\"\n\nconst people = Chunk.make(\n  { name: \"Alice\", age: 30 },\n  { name: \"Bob\", age: 25 },\n  { name: \"Charlie\", age: 35 }\n)\n\n// Sort by age\nconst byAge = Chunk.sortWith(people, (person) => person.age, Order.Number)\nconsole.log(Chunk.toArray(byAge))\n// [{ name: \"Bob\", age: 25 }, { name: \"Alice\", age: 30 }, { name: \"Charlie\", age: 35 }]\n\n// Sort by name\nconst byName = Chunk.sortWith(people, (person) => person.name, Order.String)\nconsole.log(Chunk.toArray(byName))\n// [{ name: \"Alice\", age: 30 }, { name: \"Bob\", age: 25 }, { name: \"Charlie\", age: 35 }]\n\n// Sort by string length\nconst words = Chunk.make(\"a\", \"abc\", \"ab\")\nconst byLength = Chunk.sortWith(words, (word) => word.length, Order.Number)\nconsole.log(Chunk.toArray(byLength)) // [\"a\", \"ab\", \"abc\"]";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
