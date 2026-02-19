/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: asVoid
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Replaces the value inside a `Some` with `void` (`undefined`), leaving `None` unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.asVoid(Option.some(42)))
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
 *
 * console.log(Option.asVoid(Option.none()))
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
const exportName = "asVoid";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Replaces the value inside a `Some` with `void` (`undefined`), leaving `None` unchanged.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.asVoid(Option.some(42)))\n// Output: { _id: 'Option', _tag: 'Some', value: undefined }\n\nconsole.log(Option.asVoid(Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSomeBecomesSomeUndefined = Effect.gen(function* () {
  const input = O.some(42);
  const output = O.asVoid(input);

  yield* Console.log(`Option.asVoid(Option.some(42)) -> ${formatUnknown(output)}`);
  yield* Console.log(`Some value replaced with undefined: ${output._tag === "Some" && output.value === undefined}`);
});

const exampleNoneRemainsNone = Effect.gen(function* () {
  const input = O.none<number>();
  const output = O.asVoid(input);

  yield* Console.log(`Option.asVoid(Option.none()) -> ${formatUnknown(output)}`);
  yield* Console.log(`None stays None: ${output._tag === "None"}`);
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
      title: "Some Converts to Some(undefined)",
      description: "Apply asVoid to Some and verify the wrapped value is discarded.",
      run: exampleSomeBecomesSomeUndefined,
    },
    {
      title: "None Is Preserved",
      description: "Apply asVoid to None and verify absence is unchanged.",
      run: exampleNoneRemainsNone,
    },
  ],
});

BunRuntime.runMain(program);
