/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: splitWhere
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Splits an iterable at the first element matching the predicate. The matching element is included in the second array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitWhere([1, 2, 3, 4, 5], (n) => n > 3)) // [[1, 2, 3], [4, 5]]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "splitWhere";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Splits an iterable at the first element matching the predicate. The matching element is included in the second array.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.splitWhere([1, 2, 3, 4, 5], (n) => n > 3)) // [[1, 2, 3], [4, 5]]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSplitWhere = Effect.gen(function* () {
  const readings = [1, 2, 3, 4, 5];
  const [beforeMatch, fromMatch] = A.splitWhere(readings, (n) => n > 3);

  yield* Console.log(`splitWhere([1, 2, 3, 4, 5], n > 3) -> ${JSON.stringify([beforeMatch, fromMatch])}`);
  yield* Console.log(`boundary value is included in second segment: ${JSON.stringify(fromMatch[0])}`);
});

const exampleCurriedPredicateAndNoMatch = Effect.gen(function* () {
  const splitAtIndexTwo = A.splitWhere((_, index) => index === 2);
  const [beforeIndexedMatch, fromIndexedMatch] = splitAtIndexTwo(["warmup", "check", "deploy", "verify"]);
  const [beforeNoMatch, fromNoMatch] = A.splitWhere(["alpha", "beta", "gamma"], (label) => label === "missing");

  yield* Console.log(
    `splitWhere(index === 2)(["warmup","check","deploy","verify"]) -> ${JSON.stringify([
      beforeIndexedMatch,
      fromIndexedMatch,
    ])}`
  );
  yield* Console.log(
    `splitWhere(["alpha","beta","gamma"], label === "missing") -> ${JSON.stringify([beforeNoMatch, fromNoMatch])}`
  );
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
      title: "Source-Aligned Predicate Split",
      description: "Replicate the documented call and verify the matching element starts the second segment.",
      run: exampleSourceAlignedSplitWhere,
    },
    {
      title: "Curried Predicate And No-Match Case",
      description: "Use index-aware curried invocation and show that no match returns an empty second segment.",
      run: exampleCurriedPredicateAndNoMatch,
    },
  ],
});

BunRuntime.runMain(program);
