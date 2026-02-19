/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Keeps only elements satisfying a predicate (or refinement).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Keeps only elements satisfying a predicate (or refinement).";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4];
  const result = A.filter(input, (n) => n % 2 === 0);

  yield* Console.log(`A.filter([1, 2, 3, 4], n => n % 2 === 0) => ${JSON.stringify(result)}`);
  yield* Console.log(`input remains ${JSON.stringify(input)}`);
});

const exampleCurriedAndRefinement = Effect.gen(function* () {
  const keepNumbersGreaterThanOne = A.filter((n: unknown): n is number => typeof n === "number" && n > 1);
  const greaterThanOne = keepNumbersGreaterThanOne([0, 1, 2, 3]);

  const mixed: ReadonlyArray<string | number> = [0, "a", 2, "bee", 3];
  const stringsOnly = A.filter(mixed, (value): value is string => typeof value === "string");

  yield* Console.log(`A.filter(n => n > 1)([0, 1, 2, 3]) => ${JSON.stringify(greaterThanOne)}`);
  yield* Console.log(`A.filter(mixed, isString) => ${JSON.stringify(stringsOnly)}`);
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
      title: "Source-Aligned Invocation",
      description: "Filter evens from the documented input using the data-first call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Predicate And Refinement",
      description: "Demonstrate reusable data-last filtering and refinement-based narrowing.",
      run: exampleCurriedAndRefinement,
    },
  ],
});

BunRuntime.runMain(program);
