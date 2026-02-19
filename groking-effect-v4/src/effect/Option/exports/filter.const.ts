/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Filters an `Option` using a predicate. Returns `None` if the predicate is not satisfied or the input is `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const removeEmpty = (input: Option.Option<string>) =>
 *   Option.filter(input, (value) => value !== "")
 *
 * console.log(removeEmpty(Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(removeEmpty(Option.some("")))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(removeEmpty(Option.none()))
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
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Filters an `Option` using a predicate. Returns `None` if the predicate is not satisfied or the input is `None`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst removeEmpty = (input: Option.Option<string>) =>\n  Option.filter(input, (value) => value !== \"\")\n\nconsole.log(removeEmpty(Option.some(\"hello\")))\n// Output: { _id: 'Option', _tag: 'Some', value: 'hello' }\n\nconsole.log(removeEmpty(Option.some(\"\")))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(removeEmpty(Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAligned = Effect.gen(function* () {
  const removeEmpty = (input: O.Option<string>) => O.filter(input, (value) => value !== "");

  const keepHello = removeEmpty(O.some("hello"));
  const dropEmpty = removeEmpty(O.some(""));
  const keepNone = removeEmpty(O.none<string>());

  yield* Console.log(`some("hello") -> ${formatUnknown(keepHello)}`);
  yield* Console.log(`some("") -> ${formatUnknown(dropEmpty)}`);
  yield* Console.log(`none() -> ${formatUnknown(keepNone)}`);
});

const exampleCurriedPredicate = Effect.gen(function* () {
  const keepEven = O.filter((n: number) => n % 2 === 0);

  const evenValue = keepEven(O.some(6));
  const oddValue = keepEven(O.some(5));
  const noneValue = keepEven(O.none<number>());

  yield* Console.log(`keepEven(some(6)) -> ${formatUnknown(evenValue)}`);
  yield* Console.log(`keepEven(some(5)) -> ${formatUnknown(oddValue)}`);
  yield* Console.log(`keepEven(none()) -> ${formatUnknown(noneValue)}`);
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
      title: "Source-Aligned Filtering",
      description: "Apply filter to non-empty, empty, and none inputs using the JSDoc pattern.",
      run: exampleSourceAligned,
    },
    {
      title: "Curried Predicate Reuse",
      description: "Prebuild a predicate with data-last form, then reuse it across options.",
      run: exampleCurriedPredicate,
    },
  ],
});

BunRuntime.runMain(program);
