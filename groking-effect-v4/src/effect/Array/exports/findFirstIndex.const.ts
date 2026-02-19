/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: findFirstIndex
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Returns the index of the first element matching the predicate, or `undefined` if none match.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findFirstIndex([5, 3, 8, 9], (x) => x > 5)) // 2
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findFirstIndex";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the index of the first element matching the predicate, or `undefined` if none match.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.findFirstIndex([5, 3, 8, 9], (x) => x > 5)) // 2';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const numbers = [5, 3, 8, 9];
  const firstAboveFiveIndex = A.findFirstIndex(numbers, (value) => value > 5);
  const firstAboveFive = firstAboveFiveIndex === undefined ? undefined : numbers[firstAboveFiveIndex];

  yield* Console.log(`numbers: ${formatUnknown(numbers)}`);
  yield* Console.log(`first index where value > 5: ${formatUnknown(firstAboveFiveIndex)}`);
  yield* Console.log(`value at that index: ${formatUnknown(firstAboveFive)}`);
});

const exampleNoMatchReturnsUndefined = Effect.gen(function* () {
  const queueDepths = [0, 0, 0, 0];
  const firstBusyWorkerIndex = A.findFirstIndex(queueDepths, (depth) => depth > 0);

  yield* Console.log(`queue depths: ${formatUnknown(queueDepths)}`);
  yield* Console.log(`first index where depth > 0: ${formatUnknown(firstBusyWorkerIndex)}`);
  yield* Console.log("No matching element produces undefined.");
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
      title: "Find First Matching Index",
      description: "Use the source-style invocation to locate the first value above a threshold.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "No Match Behavior",
      description: "Show that the function returns undefined when no element satisfies the predicate.",
      run: exampleNoMatchReturnsUndefined,
    },
  ],
});

BunRuntime.runMain(program);
