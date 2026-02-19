/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: unfold
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Builds an array by repeatedly applying a function to a seed value. The function returns `[element, nextSeed]` to continue, or `undefined` to stop.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.unfold(1, (n) => n <= 5 ? [n, n + 1] : undefined))
 * // [1, 2, 3, 4, 5]
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
const exportName = "unfold";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Builds an array by repeatedly applying a function to a seed value. The function returns `[element, nextSeed]` to continue, or `undefined` to stop.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.unfold(1, (n) => n <= 5 ? [n, n + 1] : undefined))\n// [1, 2, 3, 4, 5]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedRange = Effect.gen(function* () {
  const values = A.unfold(1, (n) => (n <= 5 ? [n, n + 1] : undefined));

  yield* Console.log(`A.unfold(1, n => n <= 5 ? [n, n + 1] : undefined) -> ${formatUnknown(values)}`);
  yield* Console.log(`generated values: ${values.length}`);
});

const exampleStructuredSeedAndStop = Effect.gen(function* () {
  const fibonacciSeed: readonly [number, number, number] = [0, 1, 0];
  const fibonacciPairs = A.unfold(fibonacciSeed, ([a, b, step]) =>
    step < 7 ? [[a, b] as const, [b, a + b, step + 1] as const] : undefined
  );
  const stopImmediately = A.unfold("seed", () => undefined);

  yield* Console.log(`A.unfold fibonacci pairs (7 steps) -> ${formatUnknown(fibonacciPairs)}`);
  yield* Console.log(`A.unfold("seed", () => undefined) -> ${formatUnknown(stopImmediately)}`);
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
      title: "Source-Aligned Range Generation",
      description: "Generate a finite numeric range exactly like the module documentation example.",
      run: exampleSourceAlignedRange,
    },
    {
      title: "Structured Seed + Stop Signal",
      description: "Use tuple seed state for sequence generation and show immediate stop via `undefined`.",
      run: exampleStructuredSeedAndStop,
    },
  ],
});

BunRuntime.runMain(program);
