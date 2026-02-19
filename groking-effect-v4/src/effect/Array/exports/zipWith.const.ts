/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Combines elements from two iterables pairwise using a function. If the iterables differ in length, extra elements are discarded.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Combines elements from two iterables pairwise using a function. If the iterables differ in length, extra elements are discarded.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedAddition = Effect.gen(function* () {
  const left = [1, 2, 3];
  const right = [4, 5, 6];
  const summed = A.zipWith(left, right, (a, b) => a + b);

  yield* Console.log(`zipWith([1,2,3],[4,5,6],+) => ${JSON.stringify(summed)}`);
});

const exampleTruncationBehavior = Effect.gen(function* () {
  const users = ["ada", "linus", "grace"];
  const roles = ["admin", "maintainer"];
  const assignments = A.zipWith(users, roles, (user, role) => `${user}:${role}`);

  yield* Console.log(`zipWith(users,roles,join) => ${JSON.stringify(assignments)}`);
  yield* Console.log(`result length => ${assignments.length} (shorter input wins)`);
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
      title: "Source-Aligned Addition",
      description: "Combine two numeric arrays with the documented addition callback.",
      run: exampleSourceAlignedAddition,
    },
    {
      title: "Truncation by Shorter Input",
      description: "Show zipWith stopping when one iterable runs out of values.",
      run: exampleTruncationBehavior,
    },
  ],
});

BunRuntime.runMain(program);
