/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: flatMapNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Transforms elements using a function that may return null or undefined, filtering out the null/undefined results.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Extract valid elements from nullable function results
 * const data = ["1", "2", "invalid", "4"]
 * const parsed = Iterable.flatMapNullishOr(data, (s) => {
 *   const num = parseInt(s)
 *   return isNaN(num) ? null : num * 2
 * })
 * console.log(Array.from(parsed)) // [2, 4, 8]
 *
 * // Safe property access
 * const objects = [
 *   { nested: { value: 10 } },
 *   { nested: null },
 *   { nested: { value: 20 } },
 *   {}
 * ]
 * const values = Iterable.flatMapNullishOr(objects, (obj) => obj.nested?.value)
 * console.log(Array.from(values)) // [10, 20]
 *
 * // Working with Map.get (returns undefined for missing keys)
 * const map = new Map([
 *   ["a", 1],
 *   ["b", 2],
 *   ["c", 3]
 * ])
 * const keys = ["a", "x", "b", "y", "c"]
 * const foundValues = Iterable.flatMapNullishOr(keys, (key) => map.get(key))
 * console.log(Array.from(foundValues)) // [1, 2, 3]
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
const exportName = "flatMapNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Transforms elements using a function that may return null or undefined, filtering out the null/undefined results.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Extract valid elements from nullable function results\nconst data = ["1", "2", "invalid", "4"]\nconst parsed = Iterable.flatMapNullishOr(data, (s) => {\n  const num = parseInt(s)\n  return isNaN(num) ? null : num * 2\n})\nconsole.log(Array.from(parsed)) // [2, 4, 8]\n\n// Safe property access\nconst objects = [\n  { nested: { value: 10 } },\n  { nested: null },\n  { nested: { value: 20 } },\n  {}\n]\nconst values = Iterable.flatMapNullishOr(objects, (obj) => obj.nested?.value)\nconsole.log(Array.from(values)) // [10, 20]\n\n// Working with Map.get (returns undefined for missing keys)\nconst map = new Map([\n  ["a", 1],\n  ["b", 2],\n  ["c", 3]\n])\nconst keys = ["a", "x", "b", "y", "c"]\nconst foundValues = Iterable.flatMapNullishOr(keys, (key) => map.get(key))\nconsole.log(Array.from(foundValues)) // [1, 2, 3]';
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
