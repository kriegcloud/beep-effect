/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Filters an iterable to only include elements that match a predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Filter even numbers
 * const numbers = [1, 2, 3, 4, 5, 6]
 * const evens = Iterable.filter(numbers, (x) => x % 2 === 0)
 * console.log(Array.from(evens)) // [2, 4, 6]
 *
 * // Filter with index
 * const items = ["a", "b", "c", "d"]
 * const oddPositions = Iterable.filter(items, (_, i) => i % 2 === 1)
 * console.log(Array.from(oddPositions)) // ["b", "d"]
 *
 * // Type refinement
 * const mixed: Array<string | number> = ["hello", 42, "world", 100]
 * const onlyStrings = Iterable.filter(
 *   mixed,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(Array.from(onlyStrings)) // ["hello", "world"] (typed as string[])
 *
 * // Combine with map
 * const processed = Iterable.map(
 *   Iterable.filter([1, 2, 3, 4, 5], (x) => x > 2),
 *   (x) => x * 10
 * )
 * console.log(Array.from(processed)) // [30, 40, 50]
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
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Filters an iterable to only include elements that match a predicate.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Filter even numbers\nconst numbers = [1, 2, 3, 4, 5, 6]\nconst evens = Iterable.filter(numbers, (x) => x % 2 === 0)\nconsole.log(Array.from(evens)) // [2, 4, 6]\n\n// Filter with index\nconst items = ["a", "b", "c", "d"]\nconst oddPositions = Iterable.filter(items, (_, i) => i % 2 === 1)\nconsole.log(Array.from(oddPositions)) // ["b", "d"]\n\n// Type refinement\nconst mixed: Array<string | number> = ["hello", 42, "world", 100]\nconst onlyStrings = Iterable.filter(\n  mixed,\n  (x): x is string => typeof x === "string"\n)\nconsole.log(Array.from(onlyStrings)) // ["hello", "world"] (typed as string[])\n\n// Combine with map\nconst processed = Iterable.map(\n  Iterable.filter([1, 2, 3, 4, 5], (x) => x > 2),\n  (x) => x * 10\n)\nconsole.log(Array.from(processed)) // [30, 40, 50]';
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
