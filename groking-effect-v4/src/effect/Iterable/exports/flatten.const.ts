/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: flatten
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Flattens an Iterable of Iterables into a single Iterable
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Flatten nested arrays
 * const nested = [[1, 2], [3, 4], [5, 6]]
 * const flat = Iterable.flatten(nested)
 * console.log(Array.from(flat)) // [1, 2, 3, 4, 5, 6]
 *
 * // Flatten different iterable types
 * const mixed: Array<Iterable<string>> = ["ab", "cd"]
 * const flatMixed = Iterable.flatten(mixed)
 * console.log(Array.from(flatMixed)) // ["a", "b", "c", "d"]
 *
 * // Flatten deeply nested (only one level)
 * const deepNested = [[[1, 2]], [[3, 4]]]
 * const oneLevelFlat = Iterable.flatten(deepNested)
 * console.log(Array.from(oneLevelFlat).map((arr) => Array.from(arr)))
 * // [[1, 2], [3, 4]] (still contains arrays)
 *
 * // Empty iterables are handled correctly
 * const withEmpty = [[1, 2], [], [3, 4], []]
 * const flatWithEmpty = Iterable.flatten(withEmpty)
 * console.log(Array.from(flatWithEmpty)) // [1, 2, 3, 4]
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
const exportName = "flatten";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Flattens an Iterable of Iterables into a single Iterable";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Flatten nested arrays\nconst nested = [[1, 2], [3, 4], [5, 6]]\nconst flat = Iterable.flatten(nested)\nconsole.log(Array.from(flat)) // [1, 2, 3, 4, 5, 6]\n\n// Flatten different iterable types\nconst mixed: Array<Iterable<string>> = ["ab", "cd"]\nconst flatMixed = Iterable.flatten(mixed)\nconsole.log(Array.from(flatMixed)) // ["a", "b", "c", "d"]\n\n// Flatten deeply nested (only one level)\nconst deepNested = [[[1, 2]], [[3, 4]]]\nconst oneLevelFlat = Iterable.flatten(deepNested)\nconsole.log(Array.from(oneLevelFlat).map((arr) => Array.from(arr)))\n// [[1, 2], [3, 4]] (still contains arrays)\n\n// Empty iterables are handled correctly\nconst withEmpty = [[1, 2], [], [3, 4], []]\nconst flatWithEmpty = Iterable.flatten(withEmpty)\nconsole.log(Array.from(flatWithEmpty)) // [1, 2, 3, 4]';
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
