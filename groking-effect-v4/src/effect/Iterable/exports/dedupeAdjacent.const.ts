/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: dedupeAdjacent
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Deduplicates adjacent elements that are identical.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Remove adjacent duplicate numbers
 * const numbers = [1, 1, 2, 2, 2, 3, 1, 1]
 * const deduped = Iterable.dedupeAdjacent(numbers)
 * console.log(Array.from(deduped)) // [1, 2, 3, 1]
 *
 * // Remove adjacent duplicate characters
 * const letters = "aabbccaa"
 * const dedupedLetters = Iterable.dedupeAdjacent(letters)
 * console.log(Array.from(dedupedLetters)) // ["a", "b", "c", "a"]
 *
 * // Works with objects using deep equality
 * const objects = [
 *   { type: "A" },
 *   { type: "A" },
 *   { type: "B" },
 *   { type: "B" },
 *   { type: "A" }
 * ]
 * const dedupedObjects = Iterable.dedupeAdjacent(objects)
 * console.log(Array.from(dedupedObjects).map((o) => o.type)) // ["A", "B", "A"]
 *
 * // Clean up streaming data
 * const sensorData = [100, 100, 100, 101, 101, 102, 102, 102, 100]
 * const cleanedData = Iterable.dedupeAdjacent(sensorData)
 * console.log(Array.from(cleanedData)) // [100, 101, 102, 100]
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "dedupeAdjacent";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Deduplicates adjacent elements that are identical.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Remove adjacent duplicate numbers\nconst numbers = [1, 1, 2, 2, 2, 3, 1, 1]\nconst deduped = Iterable.dedupeAdjacent(numbers)\nconsole.log(Array.from(deduped)) // [1, 2, 3, 1]\n\n// Remove adjacent duplicate characters\nconst letters = "aabbccaa"\nconst dedupedLetters = Iterable.dedupeAdjacent(letters)\nconsole.log(Array.from(dedupedLetters)) // ["a", "b", "c", "a"]\n\n// Works with objects using deep equality\nconst objects = [\n  { type: "A" },\n  { type: "A" },\n  { type: "B" },\n  { type: "B" },\n  { type: "A" }\n]\nconst dedupedObjects = Iterable.dedupeAdjacent(objects)\nconsole.log(Array.from(dedupedObjects).map((o) => o.type)) // ["A", "B", "A"]\n\n// Clean up streaming data\nconst sensorData = [100, 100, 100, 101, 101, 102, 102, 102, 100]\nconst cleanedData = Iterable.dedupeAdjacent(sensorData)\nconsole.log(Array.from(cleanedData)) // [100, 101, 102, 100]';
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
