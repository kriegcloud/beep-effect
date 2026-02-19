/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: productMany
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Combines a primary `Option` with an iterable of `Option`s into a tuple if all are `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const first = Option.some(1)
 * const rest = [Option.some(2), Option.some(3)]
 *
 * console.log(Option.productMany(first, rest))
 * // Output: { _id: 'Option', _tag: 'Some', value: [1, 2, 3] }
 *
 * console.log(Option.productMany(first, [Option.some(2), Option.none()]))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "productMany";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Combines a primary `Option` with an iterable of `Option`s into a tuple if all are `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst first = Option.some(1)\nconst rest = [Option.some(2), Option.some(3)]\n\nconsole.log(Option.productMany(first, rest))\n// Output: { _id: 'Option', _tag: 'Some', value: [1, 2, 3] }\n\nconsole.log(Option.productMany(first, [Option.some(2), Option.none()]))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedCombination = Effect.gen(function* () {
  const first = O.some(1);
  const allSome = O.productMany(first, [O.some(2), O.some(3)]);
  const withMissingTail = O.productMany(first, [O.some(2), O.none<number>()]);

  yield* Console.log(`all Some -> ${formatUnknown(allSome)}`);
  yield* Console.log(`tail includes None -> ${formatUnknown(withMissingTail)}`);
});

const exampleShortCircuitOnNone = Effect.gen(function* () {
  const visited: Array<string> = [];

  function* tracedRest() {
    visited.push("2");
    yield O.some(2);

    visited.push("None");
    yield O.none<number>();

    visited.push("99");
    yield O.some(99);
  }

  const result = O.productMany(O.some(1), tracedRest());

  yield* Console.log(`result -> ${formatUnknown(result)}`);
  yield* Console.log(`rest visited -> ${visited.join(" -> ")}`);
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
      title: "Source-Aligned Combination",
      description: "Run the documented all-Some and mixed-tail inputs to compare outcomes.",
      run: exampleSourceAlignedCombination,
    },
    {
      title: "Short-Circuit on None",
      description: "Show iterable traversal stops after the first None in the tail.",
      run: exampleShortCircuitOnNone,
    },
  ],
});

BunRuntime.runMain(program);
