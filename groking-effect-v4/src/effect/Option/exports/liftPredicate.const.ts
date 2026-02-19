/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: liftPredicate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Lifts a `Predicate` or `Refinement` into the `Option` context: returns `Some(value)` when the predicate holds, `None` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const parsePositive = Option.liftPredicate((n: number) => n > 0)
 *
 * console.log(parsePositive(1))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(parsePositive(-1))
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
const exportName = "liftPredicate";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Lifts a `Predicate` or `Refinement` into the `Option` context: returns `Some(value)` when the predicate holds, `None` otherwise.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst parsePositive = Option.liftPredicate((n: number) => n > 0)\n\nconsole.log(parsePositive(1))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }\n\nconsole.log(parsePositive(-1))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedValidation = Effect.gen(function* () {
  const parsePositive = O.liftPredicate((n: number) => n > 0);

  yield* Console.log(`parsePositive(1) -> ${formatUnknown(parsePositive(1))}`);
  yield* Console.log(`parsePositive(-1) -> ${formatUnknown(parsePositive(-1))}`);
  yield* Console.log(`parsePositive(0) -> ${formatUnknown(parsePositive(0))}`);
});

const exampleRefinementAndDualForm = Effect.gen(function* () {
  type Input = string | { readonly kind: "empty" };
  const isString = (input: Input): input is string => typeof input === "string";
  const parseString = O.liftPredicate(isString);

  const minLength5 = (text: string) => text.length >= 5;

  yield* Console.log(`parseString("payload") -> ${formatUnknown(parseString("payload"))}`);
  yield* Console.log(`parseString({ kind: "empty" }) -> ${formatUnknown(parseString({ kind: "empty" }))}`);
  yield* Console.log(`liftPredicate("effect", minLength5) -> ${formatUnknown(O.liftPredicate("effect", minLength5))}`);
  yield* Console.log(`liftPredicate("fx", minLength5) -> ${formatUnknown(O.liftPredicate("fx", minLength5))}`);
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
      title: "Source-Aligned Positive Parsing",
      description: "Lift a positivity predicate and observe Some/None outcomes for positive and non-positive inputs.",
      run: exampleSourceAlignedValidation,
    },
    {
      title: "Refinement + Data-First Invocation",
      description: "Use a refinement for type narrowing, then call the two-argument form for direct validation.",
      run: exampleRefinementAndDualForm,
    },
  ],
});

BunRuntime.runMain(program);
