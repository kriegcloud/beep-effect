/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: dedupeAdjacentWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Deduplicates adjacent elements that are identical using the provided `isEquivalent` function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * // Remove adjacent duplicates with custom equality
 * const numbers = [1, 1, 2, 2, 3, 1, 1]
 * const dedupedNumbers = Iterable.dedupeAdjacentWith(numbers, (a, b) => a === b)
 * console.log(Array.from(dedupedNumbers)) // [1, 2, 3, 1]
 * 
 * // Case-insensitive deduplication
 * const words = ["Hello", "HELLO", "world", "World", "test"]
 * const caseInsensitive = (a: string, b: string) =>
 *   a.toLowerCase() === b.toLowerCase()
 * const dedupedWords = Iterable.dedupeAdjacentWith(words, caseInsensitive)
 * console.log(Array.from(dedupedWords)) // ["Hello", "world", "test"]
 * 
 * // Deduplication by object property
 * const users = [
 *   { id: 1, name: "Alice" },
 *   { id: 1, name: "Alice Updated" }, // different name, same id
 *   { id: 2, name: "Bob" },
 *   { id: 2, name: "Bob" },
 *   { id: 3, name: "Charlie" }
 * ]
 * const byId = (a: typeof users[0], b: typeof users[0]) => a.id === b.id
 * const dedupedUsers = Iterable.dedupeAdjacentWith(users, byId)
 * console.log(Array.from(dedupedUsers).map((u) => u.id)) // [1, 2, 3]
 * 
 * // Approximate numeric equality
 * const floats = [1.0, 1.01, 1.02, 2.0, 2.01, 3.0]
 * const approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.1
 * const dedupedFloats = Iterable.dedupeAdjacentWith(floats, approxEqual)
 * console.log(Array.from(dedupedFloats)) // [1.0, 2.0, 3.0]
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
import * as IterableModule from "effect/Iterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "dedupeAdjacentWith";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Deduplicates adjacent elements that are identical using the provided `isEquivalent` function.";
const sourceExample = "import { Iterable } from \"effect\"\n\n// Remove adjacent duplicates with custom equality\nconst numbers = [1, 1, 2, 2, 3, 1, 1]\nconst dedupedNumbers = Iterable.dedupeAdjacentWith(numbers, (a, b) => a === b)\nconsole.log(Array.from(dedupedNumbers)) // [1, 2, 3, 1]\n\n// Case-insensitive deduplication\nconst words = [\"Hello\", \"HELLO\", \"world\", \"World\", \"test\"]\nconst caseInsensitive = (a: string, b: string) =>\n  a.toLowerCase() === b.toLowerCase()\nconst dedupedWords = Iterable.dedupeAdjacentWith(words, caseInsensitive)\nconsole.log(Array.from(dedupedWords)) // [\"Hello\", \"world\", \"test\"]\n\n// Deduplication by object property\nconst users = [\n  { id: 1, name: \"Alice\" },\n  { id: 1, name: \"Alice Updated\" }, // different name, same id\n  { id: 2, name: \"Bob\" },\n  { id: 2, name: \"Bob\" },\n  { id: 3, name: \"Charlie\" }\n]\nconst byId = (a: typeof users[0], b: typeof users[0]) => a.id === b.id\nconst dedupedUsers = Iterable.dedupeAdjacentWith(users, byId)\nconsole.log(Array.from(dedupedUsers).map((u) => u.id)) // [1, 2, 3]\n\n// Approximate numeric equality\nconst floats = [1.0, 1.01, 1.02, 2.0, 2.01, 3.0]\nconst approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.1\nconst dedupedFloats = Iterable.dedupeAdjacentWith(floats, approxEqual)\nconsole.log(Array.from(dedupedFloats)) // [1.0, 2.0, 3.0]";
const moduleRecord = IterableModule as Record<string, unknown>;

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
