/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: zip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Takes two `Iterable`s and returns an `Iterable` of corresponding pairs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 2, 3]
 * const letters = ["a", "b", "c"]
 * const zipped = Iterable.zip(numbers, letters)
 * console.log(Array.from(zipped)) // [[1, "a"], [2, "b"], [3, "c"]]
 *
 * // Different lengths - shorter one determines result length
 * const short = [1, 2]
 * const long = ["a", "b", "c", "d"]
 * const partial = Iterable.zip(short, long)
 * console.log(Array.from(partial)) // [[1, "a"], [2, "b"]]
 *
 * // Works with any iterables
 * const range = Iterable.range(1, 3)
 * const word = "abc"
 * const mixed = Iterable.zip(range, word)
 * console.log(Array.from(mixed)) // [[1, "a"], [2, "b"], [3, "c"]]
 *
 * // Create indexed pairs
 * const values = ["apple", "banana", "cherry"]
 * const indices = Iterable.range(0, 2)
 * const indexed = Iterable.zip(indices, values)
 * console.log(Array.from(indexed)) // [[0, "apple"], [1, "banana"], [2, "cherry"]]
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
const exportName = "zip";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Takes two `Iterable`s and returns an `Iterable` of corresponding pairs.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 2, 3]\nconst letters = ["a", "b", "c"]\nconst zipped = Iterable.zip(numbers, letters)\nconsole.log(Array.from(zipped)) // [[1, "a"], [2, "b"], [3, "c"]]\n\n// Different lengths - shorter one determines result length\nconst short = [1, 2]\nconst long = ["a", "b", "c", "d"]\nconst partial = Iterable.zip(short, long)\nconsole.log(Array.from(partial)) // [[1, "a"], [2, "b"]]\n\n// Works with any iterables\nconst range = Iterable.range(1, 3)\nconst word = "abc"\nconst mixed = Iterable.zip(range, word)\nconsole.log(Array.from(mixed)) // [[1, "a"], [2, "b"], [3, "c"]]\n\n// Create indexed pairs\nconst values = ["apple", "banana", "cherry"]\nconst indices = Iterable.range(0, 2)\nconst indexed = Iterable.zip(indices, values)\nconsole.log(Array.from(indexed)) // [[0, "apple"], [1, "banana"], [2, "cherry"]]';
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
