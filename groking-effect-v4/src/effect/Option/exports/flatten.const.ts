/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: flatten
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Flattens a nested `Option<Option<A>>` into `Option<A>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.flatten(Option.some(Option.some("value"))))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'value' }
 *
 * console.log(Option.flatten(Option.some(Option.none())))
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
const exportName = "flatten";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Flattens a nested `Option<Option<A>>` into `Option<A>`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.flatten(Option.some(Option.some(\"value\"))))\n// Output: { _id: 'Option', _tag: 'Some', value: 'value' }\n\nconsole.log(Option.flatten(Option.some(Option.none())))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedFlattening = Effect.gen(function* () {
  const nestedSome = O.some(O.some("value"));
  const nestedNone = O.some(O.none<string>());
  const absentNested = O.none<O.Option<string>>();

  yield* Console.log(`some(some("value")) -> ${formatUnknown(O.flatten(nestedSome))}`);
  yield* Console.log(`some(none()) -> ${formatUnknown(O.flatten(nestedNone))}`);
  yield* Console.log(`none() -> ${formatUnknown(O.flatten(absentNested))}`);
});

const exampleMapThenFlatten = Effect.gen(function* () {
  const parseInteger = (input: string): O.Option<number> =>
    /^-?\d+$/.test(input) ? O.some(Number.parseInt(input, 10)) : O.none();

  const fromNumeric = O.some("42").pipe(O.map(parseInteger));
  const fromInvalid = O.some("4.2").pipe(O.map(parseInteger));
  const fromAbsent = O.none<string>().pipe(O.map(parseInteger));

  yield* Console.log(`map(parse) from some("42") -> ${formatUnknown(fromNumeric)}`);
  yield* Console.log(`flatten(...) -> ${formatUnknown(O.flatten(fromNumeric))}`);
  yield* Console.log(`map(parse) from some("4.2") -> ${formatUnknown(fromInvalid)}`);
  yield* Console.log(`flatten(...) -> ${formatUnknown(O.flatten(fromInvalid))}`);
  yield* Console.log(`map(parse) from none() -> ${formatUnknown(fromAbsent)}`);
  yield* Console.log(`flatten(...) -> ${formatUnknown(O.flatten(fromAbsent))}`);
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
      title: "Source-Aligned Nested Cases",
      description: "Flatten nested Some/None cases from the JSDoc contract, including an outer None.",
      run: exampleSourceAlignedFlattening,
    },
    {
      title: "Map Then Flatten",
      description: "Show how flatten removes nesting created by mapping to an Option-returning parser.",
      run: exampleMapThenFlatten,
    },
  ],
});

BunRuntime.runMain(program);
