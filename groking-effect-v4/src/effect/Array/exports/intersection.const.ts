/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: intersection
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Computes the intersection of two arrays using `Equal.equivalence()`. Order is determined by the first array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.intersection([1, 2, 3], [3, 4, 1])) // [1, 3]
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
const exportName = "intersection";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Computes the intersection of two arrays using `Equal.equivalence()`. Order is determined by the first array.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.intersection([1, 2, 3], [3, 4, 1])) // [1, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const left = [1, 2, 3];
  const right = [3, 4, 1];
  const result = A.intersection(left, right);

  yield* Console.log(`intersection([1, 2, 3], [3, 4, 1]) => ${JSON.stringify(result)}`);
  yield* Console.log(`left input remains ${JSON.stringify(left)}`);
});

const exampleCurriedIterableAndOrder = Effect.gen(function* () {
  const intersectWithAlphaBeta = A.intersection(["alpha", "beta"]);
  const fromSet = intersectWithAlphaBeta(new Set(["zeta", "alpha", "beta", "alpha"]));
  const preservesLeftOrder = A.intersection(["c", "a", "b", "a"], ["b", "a"]);

  yield* Console.log(`intersection(["alpha", "beta"])(Set(...)) => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`intersection(["c", "a", "b", "a"], ["b", "a"]) => ${JSON.stringify(preservesLeftOrder)}`);
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
      description: "Compute overlap using the documented two-argument call form.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable + Left Order",
      description: "Use data-last style with an iterable and show that the first input controls result order.",
      run: exampleCurriedIterableAndOrder,
    },
  ],
});

BunRuntime.runMain(program);
