/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.170Z
 *
 * Overview:
 * Transforms each element of an iterable using a function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Transform numbers to their squares
 * const numbers = [1, 2, 3, 4, 5]
 * const squares = Iterable.map(numbers, (x) => x * x)
 * console.log(Array.from(squares)) // [1, 4, 9, 16, 25]
 *
 * // Use index in transformation
 * const indexed = Iterable.map(["a", "b", "c"], (char, i) => `${i}: ${char}`)
 * console.log(Array.from(indexed)) // ["0: a", "1: b", "2: c"]
 *
 * // Chain transformations
 * const result = Iterable.map(
 *   Iterable.map([1, 2, 3], (x) => x * 2),
 *   (x) => x + 1
 * )
 * console.log(Array.from(result)) // [3, 5, 7]
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Transforms each element of an iterable using a function.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Transform numbers to their squares\nconst numbers = [1, 2, 3, 4, 5]\nconst squares = Iterable.map(numbers, (x) => x * x)\nconsole.log(Array.from(squares)) // [1, 4, 9, 16, 25]\n\n// Use index in transformation\nconst indexed = Iterable.map(["a", "b", "c"], (char, i) => `${i}: ${char}`)\nconsole.log(Array.from(indexed)) // ["0: a", "1: b", "2: c"]\n\n// Chain transformations\nconst result = Iterable.map(\n  Iterable.map([1, 2, 3], (x) => x * 2),\n  (x) => x + 1\n)\nconsole.log(Array.from(result)) // [3, 5, 7]';
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
