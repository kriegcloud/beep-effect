/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: span
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Splits an iterable into two arrays: the longest prefix where the predicate holds, and the remaining elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]
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
const exportName = "span";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Splits an iterable into two arrays: the longest prefix where the predicate holds, and the remaining elements.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const [prefix, rest] = A.span([1, 3, 2, 4, 5], (x) => x % 2 === 1);

  yield* Console.log(`A.span([1, 3, 2, 4, 5], isOdd) => prefix=${JSON.stringify(prefix)} rest=${JSON.stringify(rest)}`);
});

const exampleCurriedPredicateBoundary = Effect.gen(function* () {
  const splitCriticalWindow = A.span((value, index) => {
    const numeric = typeof value === "number" ? value : Number(value);
    return numeric < 10 && index < 3;
  });
  const [safePrefix, criticalRest] = splitCriticalWindow(new Set([3, 6, 9, 12, 15]));
  const [noPrefix, allRest] = A.span([2, 4, 6], (x) => x % 2 === 1);

  yield* Console.log(
    `A.span(value<10 && index<3)(Set[3,6,9,12,15]) => prefix=${JSON.stringify(safePrefix)} rest=${JSON.stringify(criticalRest)}`
  );
  yield* Console.log(`A.span([2, 4, 6], isOdd) => prefix=${JSON.stringify(noPrefix)} rest=${JSON.stringify(allRest)}`);
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
      description: "Split at the first non-odd value using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Predicate Boundary",
      description: "Use data-last form with index-aware checks and show the no-prefix edge case.",
      run: exampleCurriedPredicateBoundary,
    },
  ],
});

BunRuntime.runMain(program);
