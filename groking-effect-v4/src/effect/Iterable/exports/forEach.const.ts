/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: forEach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Iterate over the `Iterable` applying `f`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * // Print each element
 * const numbers = [1, 2, 3, 4, 5]
 * Iterable.forEach(numbers, (n) => console.log(n))
 * // Prints: 1, 2, 3, 4, 5
 * 
 * // Use index in the callback
 * const letters = ["a", "b", "c"]
 * Iterable.forEach(letters, (letter, i) => {
 *   console.log(`${i}: ${letter}`)
 * })
 * // Prints: "0: a", "1: b", "2: c"
 * 
 * // Side effects with any iterable
 * const results: Array<number> = []
 * Iterable.forEach(Iterable.range(1, 5), (n) => {
 *   results.push(n * n)
 * })
 * console.log(results) // [1, 4, 9, 16, 25]
 * 
 * // Process in chunks
 * const data = Iterable.chunksOf([1, 2, 3, 4, 5, 6], 2)
 * Iterable.forEach(data, (chunk) => {
 *   console.log(`Processing chunk: ${Array.from(chunk)}`)
 * })
 * // Prints: "Processing chunk: 1,2", "Processing chunk: 3,4", "Processing chunk: 5,6"
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
const exportName = "forEach";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Iterate over the `Iterable` applying `f`.";
const sourceExample = "import { Iterable } from \"effect\"\n\n// Print each element\nconst numbers = [1, 2, 3, 4, 5]\nIterable.forEach(numbers, (n) => console.log(n))\n// Prints: 1, 2, 3, 4, 5\n\n// Use index in the callback\nconst letters = [\"a\", \"b\", \"c\"]\nIterable.forEach(letters, (letter, i) => {\n  console.log(`${i}: ${letter}`)\n})\n// Prints: \"0: a\", \"1: b\", \"2: c\"\n\n// Side effects with any iterable\nconst results: Array<number> = []\nIterable.forEach(Iterable.range(1, 5), (n) => {\n  results.push(n * n)\n})\nconsole.log(results) // [1, 4, 9, 16, 25]\n\n// Process in chunks\nconst data = Iterable.chunksOf([1, 2, 3, 4, 5, 6], 2)\nIterable.forEach(data, (chunk) => {\n  console.log(`Processing chunk: ${Array.from(chunk)}`)\n})\n// Prints: \"Processing chunk: 1,2\", \"Processing chunk: 3,4\", \"Processing chunk: 5,6\"";
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
