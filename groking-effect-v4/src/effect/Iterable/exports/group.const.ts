/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: group
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Group equal, consecutive elements of an `Iterable` into `NonEmptyArray`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 1, 2, 2, 2, 3, 1, 1]
 * const grouped = Iterable.group(numbers)
 * console.log(Array.from(grouped))
 * // [[1, 1], [2, 2, 2], [3], [1, 1]]
 *
 * const letters = "aabbccaa"
 * const groupedLetters = Iterable.group(letters)
 * console.log(Array.from(groupedLetters))
 * // [["a", "a"], ["b", "b"], ["c", "c"], ["a", "a"]]
 *
 * // Works with objects using deep equality
 * const objects = [
 *   { type: "A", value: 1 },
 *   { type: "A", value: 1 },
 *   { type: "B", value: 2 },
 *   { type: "A", value: 1 }
 * ]
 * const groupedObjects = Iterable.group(objects)
 * console.log(Array.from(groupedObjects).length) // 3 groups
 * // Note: Only consecutive equal objects are grouped together
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "group";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Group equal, consecutive elements of an `Iterable` into `NonEmptyArray`s.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 1, 2, 2, 2, 3, 1, 1]\nconst grouped = Iterable.group(numbers)\nconsole.log(Array.from(grouped))\n// [[1, 1], [2, 2, 2], [3], [1, 1]]\n\nconst letters = "aabbccaa"\nconst groupedLetters = Iterable.group(letters)\nconsole.log(Array.from(groupedLetters))\n// [["a", "a"], ["b", "b"], ["c", "c"], ["a", "a"]]\n\n// Works with objects using deep equality\nconst objects = [\n  { type: "A", value: 1 },\n  { type: "A", value: 1 },\n  { type: "B", value: 2 },\n  { type: "A", value: 1 }\n]\nconst groupedObjects = Iterable.group(objects)\nconsole.log(Array.from(groupedObjects).length) // 3 groups\n// Note: Only consecutive equal objects are grouped together';
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
