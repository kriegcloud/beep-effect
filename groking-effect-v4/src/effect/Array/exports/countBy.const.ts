/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: countBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Counts the elements in an iterable that satisfy a predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0)
 * console.log(result) // 2
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
const exportName = "countBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Counts the elements in an iterable that satisfy a predicate.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0)\nconsole.log(result) // 2';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedDataFirst = Effect.gen(function* () {
  const evenCount = A.countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0);
  const greaterThanThree = A.countBy([1, 2, 3, 4, 5], (n) => n > 3);

  yield* Console.log(`Array.countBy([1, 2, 3, 4, 5], isEven) => ${evenCount}`);
  yield* Console.log(`Array.countBy([1, 2, 3, 4, 5], (n) => n > 3) => ${greaterThanThree}`);
});

const exampleCurriedIndexAwarePredicate = Effect.gen(function* () {
  const countAtOrAboveIndex = A.countBy((value, index) => typeof value === "number" && value >= index);
  const counted = countAtOrAboveIndex([0, 2, 1, 5]);
  const emptyCount = countAtOrAboveIndex([]);

  yield* Console.log(`Array.countBy((n, i) => n >= i)([0, 2, 1, 5]) => ${counted}`);
  yield* Console.log(`Array.countBy((n, i) => n >= i)([]) => ${emptyCount}`);
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
      title: "Source-Aligned Data-First Usage",
      description: "Use countBy(iterable, predicate) to count matching values.",
      run: exampleSourceAlignedDataFirst,
    },
    {
      title: "Curried Predicate with Index Access",
      description: "Use countBy(predicate)(iterable) and include index-aware logic.",
      run: exampleCurriedIndexAwarePredicate,
    },
  ],
});

BunRuntime.runMain(program);
