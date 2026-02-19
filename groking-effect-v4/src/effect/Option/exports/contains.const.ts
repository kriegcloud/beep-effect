/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: contains
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Checks if an `Option` contains a value equal to the given one, using default structural equality.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.some(2).pipe(Option.contains(2)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(Option.contains(2)))
 * // Output: false
 *
 * console.log(Option.none().pipe(Option.contains(2)))
 * // Output: false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "contains";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Checks if an `Option` contains a value equal to the given one, using default structural equality.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.some(2).pipe(Option.contains(2)))\n// Output: true\n\nconsole.log(Option.some(1).pipe(Option.contains(2)))\n// Output: false\n\nconsole.log(Option.none().pipe(Option.contains(2)))\n// Output: false';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedComparison = Effect.gen(function* () {
  const containsTwo = O.contains(2);
  const someTwoContainsTwo = O.some(2).pipe(containsTwo);
  const someOneContainsTwo = O.some(1).pipe(containsTwo);
  const noneContainsTwo = O.none<number>().pipe(containsTwo);

  yield* Console.log(`some(2) contains 2 -> ${someTwoContainsTwo}`);
  yield* Console.log(`some(1) contains 2 -> ${someOneContainsTwo}`);
  yield* Console.log(`none contains 2 -> ${noneContainsTwo}`);
});

const exampleStructuralEquality = Effect.gen(function* () {
  const target = { id: 1, tags: ["x", "y"] };
  const matchesStructurally = O.some({ id: 1, tags: ["x", "y"] }).pipe(O.contains(target));
  const mismatchesStructurally = O.some({ id: 1, tags: ["x", "z"] }).pipe(O.contains(target));

  yield* Console.log(`nested object match -> ${matchesStructurally}`);
  yield* Console.log(`nested object mismatch -> ${mismatchesStructurally}`);
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
      title: "Source-Aligned Number Checks",
      description: "Mirror the JSDoc flow with matching, non-matching, and none cases.",
      run: exampleSourceAlignedComparison,
    },
    {
      title: "Structural Equality Check",
      description: "Show deep structural comparison with nested object values.",
      run: exampleStructuralEquality,
    },
  ],
});

BunRuntime.runMain(program);
