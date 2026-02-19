/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: filterMapWhile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Transforms all elements of the `Iterable` for as long as the specified function returns some value
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * import * as Option from "effect/Option"
 *
 * // Parse numbers until we hit an invalid one
 * const strings = ["1", "2", "3", "invalid", "4", "5"]
 * const numbers = Iterable.filterMapWhile(strings, (s) => {
 *   const num = parseInt(s)
 *   return isNaN(num) ? Option.none() : Option.some(num)
 * })
 * console.log(Array.from(numbers)) // [1, 2, 3] (stops at "invalid")
 *
 * // Take elements while they meet a condition and transform them
 * const values = [2, 4, 6, 7, 8, 10]
 * const doubledEvens = Iterable.filterMapWhile(
 *   values,
 *   (n) => n % 2 === 0 ? Option.some(n * 2) : Option.none()
 * )
 * console.log(Array.from(doubledEvens)) // [4, 8, 12] (stops at 7)
 *
 * // Process with index until condition fails
 * const letters = ["a", "b", "c", "d", "e"]
 * const indexedUntilC = Iterable.filterMapWhile(
 *   letters,
 *   (letter, i) => letter !== "c" ? Option.some(`${i}: ${letter}`) : Option.none()
 * )
 * console.log(Array.from(indexedUntilC)) // ["0: a", "1: b"] (stops at "c")
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
const exportName = "filterMapWhile";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Transforms all elements of the `Iterable` for as long as the specified function returns some value";
const sourceExample =
  'import { Iterable } from "effect"\nimport * as Option from "effect/Option"\n\n// Parse numbers until we hit an invalid one\nconst strings = ["1", "2", "3", "invalid", "4", "5"]\nconst numbers = Iterable.filterMapWhile(strings, (s) => {\n  const num = parseInt(s)\n  return isNaN(num) ? Option.none() : Option.some(num)\n})\nconsole.log(Array.from(numbers)) // [1, 2, 3] (stops at "invalid")\n\n// Take elements while they meet a condition and transform them\nconst values = [2, 4, 6, 7, 8, 10]\nconst doubledEvens = Iterable.filterMapWhile(\n  values,\n  (n) => n % 2 === 0 ? Option.some(n * 2) : Option.none()\n)\nconsole.log(Array.from(doubledEvens)) // [4, 8, 12] (stops at 7)\n\n// Process with index until condition fails\nconst letters = ["a", "b", "c", "d", "e"]\nconst indexedUntilC = Iterable.filterMapWhile(\n  letters,\n  (letter, i) => letter !== "c" ? Option.some(`${i}: ${letter}`) : Option.none()\n)\nconsole.log(Array.from(indexedUntilC)) // ["0: a", "1: b"] (stops at "c")';
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
