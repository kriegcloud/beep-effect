/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: zipRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * Sequences two `Option`s, keeping the value from the second if both are `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.zipRight(Option.some(1), Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(Option.zipRight(Option.none(), Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "zipRight";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Sequences two `Option`s, keeping the value from the second if both are `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.zipRight(Option.some(1), Option.some(\"hello\")))\n// Output: { _id: 'Option', _tag: 'Some', value: 'hello' }\n\nconsole.log(Option.zipRight(Option.none(), Option.some(\"hello\")))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

const formatOption = <A>(option: O.Option<A>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  })(option);

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.zipRight as a callable runtime export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleKeepRightWhenBothSome = Effect.gen(function* () {
  yield* Console.log("When both values are Some, zipRight keeps the right-side value.");
  const left = O.some(1);
  const right = O.some("hello");
  const zipped = O.zipRight(left, right);

  yield* Console.log(`zipRight(Some(1), Some("hello")) => ${formatOption(zipped)}`);
});

const exampleNoneShortCircuit = Effect.gen(function* () {
  yield* Console.log("If either side is None, the result is None.");
  const noneLeft = O.zipRight(O.none<number>(), O.some("hello"));
  const noneRight = O.zipRight(O.some(1), O.none<string>());

  yield* Console.log(`zipRight(None, Some("hello")) => ${formatOption(noneLeft)}`);
  yield* Console.log(`zipRight(Some(1), None) => ${formatOption(noneRight)}`);
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
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Keep Right Value",
      description: "Demonstrate that the right Option value is preserved when both sides are Some.",
      run: exampleKeepRightWhenBothSome,
    },
    {
      title: "None Short-Circuit",
      description: "Show that None on either side produces None.",
      run: exampleNoneShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
