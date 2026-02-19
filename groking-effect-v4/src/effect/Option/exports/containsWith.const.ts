/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: containsWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Checks if an `Option` contains a value equivalent to the given one, using a custom `Equivalence`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Option } from "effect"
 *
 * const check = Option.containsWith(Equivalence.strictEqual<number>())
 *
 * console.log(Option.some(2).pipe(check(2)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(check(2)))
 * // Output: false
 *
 * console.log(Option.none().pipe(check(2)))
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
import * as Equivalence from "effect/Equivalence";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "containsWith";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Checks if an `Option` contains a value equivalent to the given one, using a custom `Equivalence`.";
const sourceExample =
  'import { Equivalence, Option } from "effect"\n\nconst check = Option.containsWith(Equivalence.strictEqual<number>())\n\nconsole.log(Option.some(2).pipe(check(2)))\n// Output: true\n\nconsole.log(Option.some(1).pipe(check(2)))\n// Output: false\n\nconsole.log(Option.none().pipe(check(2)))\n// Output: false';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedCheck = Effect.gen(function* () {
  const check = O.containsWith(Equivalence.strictEqual<number>());
  const someTwoContainsTwo = O.some(2).pipe(check(2));
  const someOneContainsTwo = O.some(1).pipe(check(2));
  const noneContainsTwo = O.none<number>().pipe(check(2));

  yield* Console.log(`some(2) contains 2 -> ${someTwoContainsTwo}`);
  yield* Console.log(`some(1) contains 2 -> ${someOneContainsTwo}`);
  yield* Console.log(`none contains 2 -> ${noneContainsTwo}`);
});

const exampleCustomStringEquivalence = Effect.gen(function* () {
  const containsIgnoringCaseAndSpacing = O.containsWith<string>(
    (self, that) => self.trim().toLowerCase() === that.trim().toLowerCase()
  );

  const curriedMatch = O.some("  BeEp ").pipe(containsIgnoringCaseAndSpacing("beep"));
  const uncurriedMismatch = containsIgnoringCaseAndSpacing(O.some("effect"), "affect");
  const noneResult = containsIgnoringCaseAndSpacing(O.none<string>(), "beep");

  yield* Console.log(`normalized string match -> ${curriedMatch}`);
  yield* Console.log(`normalized string mismatch -> ${uncurriedMismatch}`);
  yield* Console.log(`none with normalized check -> ${noneResult}`);
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
      title: "Source-Aligned Strict Equality",
      description: "Mirror the JSDoc flow with strict number equality.",
      run: exampleSourceAlignedCheck,
    },
    {
      title: "Custom String Equivalence",
      description: "Use a case-insensitive trimmed equivalence in curried and uncurried forms.",
      run: exampleCustomStringEquivalence,
    },
  ],
});

BunRuntime.runMain(program);
