/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Check if a predicate holds true for some `Iterable` element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 3, 5, 7, 8]
 * const hasEven = Iterable.some(numbers, (x) => x % 2 === 0)
 * console.log(hasEven) // true (because of 8)
 *
 * const allOdd = [1, 3, 5, 7]
 * const hasEvenInAllOdd = Iterable.some(allOdd, (x) => x % 2 === 0)
 * console.log(hasEvenInAllOdd) // false
 *
 * // With index
 * const letters = ["a", "b", "c"]
 * const hasElementAtIndex2 = Iterable.some(letters, (_, i) => i === 2)
 * console.log(hasElementAtIndex2) // true
 *
 * // Early termination - stops at first match
 * const infiniteOdds = Iterable.filter(Iterable.range(1), (x) => x % 2 === 1)
 * const hasEvenInInfiniteOdds = Iterable.some(
 *   Iterable.take(infiniteOdds, 1000),
 *   (x) => x % 2 === 0
 * )
 * console.log(hasEvenInInfiniteOdds) // false (quickly, doesn't check all 1000)
 *
 * // Type guard usage
 * const mixed: Array<string | number> = [1, 2, "hello"]
 * const hasString = Iterable.some(
 *   mixed,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(hasString) // true
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
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Check if a predicate holds true for some `Iterable` element.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 3, 5, 7, 8]\nconst hasEven = Iterable.some(numbers, (x) => x % 2 === 0)\nconsole.log(hasEven) // true (because of 8)\n\nconst allOdd = [1, 3, 5, 7]\nconst hasEvenInAllOdd = Iterable.some(allOdd, (x) => x % 2 === 0)\nconsole.log(hasEvenInAllOdd) // false\n\n// With index\nconst letters = ["a", "b", "c"]\nconst hasElementAtIndex2 = Iterable.some(letters, (_, i) => i === 2)\nconsole.log(hasElementAtIndex2) // true\n\n// Early termination - stops at first match\nconst infiniteOdds = Iterable.filter(Iterable.range(1), (x) => x % 2 === 1)\nconst hasEvenInInfiniteOdds = Iterable.some(\n  Iterable.take(infiniteOdds, 1000),\n  (x) => x % 2 === 0\n)\nconsole.log(hasEvenInInfiniteOdds) // false (quickly, doesn\'t check all 1000)\n\n// Type guard usage\nconst mixed: Array<string | number> = [1, 2, "hello"]\nconst hasString = Iterable.some(\n  mixed,\n  (x): x is string => typeof x === "string"\n)\nconsole.log(hasString) // true';
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
