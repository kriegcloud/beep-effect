/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Creates an `Equivalence` for arrays based on an element `Equivalence`. Two arrays are equivalent when they have the same length and all elements are pairwise equivalent.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const eq = Array.makeEquivalence<number>((a, b) => a === b)
 * console.log(eq([1, 2, 3], [1, 2, 3])) // true
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
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Creates an `Equivalence` for arrays based on an element `Equivalence`. Two arrays are equivalent when they have the same length and all elements are pairwise equivalent.";
const sourceExample =
  'import { Array } from "effect"\n\nconst eq = Array.makeEquivalence<number>((a, b) => a === b)\nconsole.log(eq([1, 2, 3], [1, 2, 3])) // true';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeEquivalence as the array equivalence constructor.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedEquivalence = Effect.gen(function* () {
  const eq = A.makeEquivalence<number>((left, right) => left === right);

  yield* Console.log(`[1, 2, 3] vs [1, 2, 3] -> ${eq([1, 2, 3], [1, 2, 3])}`);
  yield* Console.log(`[1, 2, 3] vs [1, 2, 4] -> ${eq([1, 2, 3], [1, 2, 4])}`);
  yield* Console.log(`[1, 2, 3] vs [1, 2] -> ${eq([1, 2, 3], [1, 2])}`);
});

const exampleCustomElementRule = Effect.gen(function* () {
  const eqCaseInsensitive = A.makeEquivalence<string>(
    (left, right) => left.trim().toLowerCase() === right.trim().toLowerCase()
  );

  yield* Console.log(`[" A ", "b"] vs ["a", "B "] (normalized) -> ${eqCaseInsensitive([" A ", "b"], ["a", "B "])}`);
  yield* Console.log(
    `["One", "Two"] vs ["one", "too"] (normalized) -> ${eqCaseInsensitive(["One", "Two"], ["one", "too"])}`
  );
  yield* Console.log(`["x"] vs ["x", "x"] (length mismatch) -> ${eqCaseInsensitive(["x"], ["x", "x"])}`);
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
      title: "Source-Aligned Strict Equivalence",
      description: "Mirror the JSDoc behavior for equal arrays, mismatched elements, and mismatched lengths.",
      run: exampleSourceAlignedEquivalence,
    },
    {
      title: "Custom Element Equivalence",
      description: "Apply a normalized string comparator while preserving pairwise and length checks.",
      run: exampleCustomElementRule,
    },
  ],
});

BunRuntime.runMain(program);
