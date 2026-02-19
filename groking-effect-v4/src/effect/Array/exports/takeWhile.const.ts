/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: takeWhile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Takes elements from the start while the predicate holds, stopping at the first element that fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]
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
const exportName = "takeWhile";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Takes elements from the start while the predicate holds, stopping at the first element that fails.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for the takeWhile export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedTakeWhile = Effect.gen(function* () {
  const readings = [1, 3, 2, 4, 1, 2];
  const result = A.takeWhile(readings, (x) => x < 4);

  yield* Console.log(`A.takeWhile([1, 3, 2, 4, 1, 2], x < 4) => ${JSON.stringify(result)}`);
  yield* Console.log("Selection stops once a value fails the predicate.");
});

const exampleCurriedAndFirstFailureBoundary = Effect.gen(function* () {
  const keepNonNegative = A.takeWhile((n) => {
    const numeric = typeof n === "number" ? n : Number(n);
    return numeric >= 0;
  });
  const untilFirstNegative = keepNonNegative([5, 2, 0, -1, 7]);
  const failsImmediately = A.takeWhile([9, 8, 7], (n) => n < 0);

  yield* Console.log(`A.takeWhile(n >= 0)([5, 2, 0, -1, 7]) => ${JSON.stringify(untilFirstNegative)}`);
  yield* Console.log(`A.takeWhile([9, 8, 7], n < 0) => ${JSON.stringify(failsImmediately)}`);
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
      title: "Source-Aligned Prefix Selection",
      description: "Mirror the documented call and keep only the leading values that satisfy the predicate.",
      run: exampleSourceAlignedTakeWhile,
    },
    {
      title: "Curried Form + Boundary Failure",
      description: "Use data-last style and show both stop-on-failure and immediate-empty outcomes.",
      run: exampleCurriedAndFirstFailureBoundary,
    },
  ],
});

BunRuntime.runMain(program);
