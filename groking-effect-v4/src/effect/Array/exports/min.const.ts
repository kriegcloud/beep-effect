/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: min
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Returns the minimum element of a non-empty array according to the given `Order`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.min([3, 1, 2], Order.Number)) // 1
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
import { pipe } from "effect/Function";
import * as Order from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "min";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the minimum element of a non-empty array according to the given `Order`.";
const sourceExample = 'import { Array, Order } from "effect"\n\nconsole.log(Array.min([3, 1, 2], Order.Number)) // 1';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log(`typeof Array.min => ${typeof A.min}`);
  yield* Console.log(`Array.min.length => ${A.min.length}`);
  yield* Console.log("Contract: pass a non-empty array and a compatible Order.");
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const numbers = [3, 1, 2] as const;
  const minimum = A.min(numbers, Order.Number);

  yield* Console.log(`Array.min([3, 1, 2], Order.Number) => ${minimum}`);
});

const exampleCurriedCustomOrder = Effect.gen(function* () {
  const byLength = Order.mapInput(Order.Number, (word: string) => word.length);
  const shortest = pipe(["effect", "fx", "array"] as const, A.min(byLength));
  const firstTieWinner = A.min(["aa", "b", "c"] as const, byLength);

  yield* Console.log(`pipe(["effect", "fx", "array"], Array.min(byLength)) => ${shortest}`);
  yield* Console.log(`Array.min(["aa", "b", "c"], byLength) => ${firstTieWinner}`);
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
      description: "Confirm min is a callable dual API and restate its non-empty contract.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Numeric Minimum",
      description: "Run the documented numeric minimum example using Order.Number.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Usage with Custom Order",
      description: "Use data-last style and mapInput to compute minimum by string length.",
      run: exampleCurriedCustomOrder,
    },
  ],
});

BunRuntime.runMain(program);
