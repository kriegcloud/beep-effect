/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromUndefinedOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Converts a possibly `undefined` value into an `Option`, leaving `null` as a valid `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromUndefinedOr(undefined))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromUndefinedOr(null))
 * // Output: { _id: 'Option', _tag: 'Some', value: null }
 *
 * console.log(Option.fromUndefinedOr(42))
 * // Output: { _id: 'Option', _tag: 'Some', value: 42 }
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
const exportName = "fromUndefinedOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a possibly `undefined` value into an `Option`, leaving `null` as a valid `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromUndefinedOr(undefined))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromUndefinedOr(null))\n// Output: { _id: 'Option', _tag: 'Some', value: null }\n\nconsole.log(Option.fromUndefinedOr(42))\n// Output: { _id: 'Option', _tag: 'Some', value: 42 }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const formatOption = (option: O.Option<unknown>): string =>
  option._tag === "None" ? "None" : `Some(${formatUnknown(option.value)})`;

const exampleSourceAlignedConversions = Effect.gen(function* () {
  const samples: ReadonlyArray<undefined | null | number> = [undefined, null, 42];

  for (const sample of samples) {
    const label = sample === undefined ? "undefined" : formatUnknown(sample);
    const option = O.fromUndefinedOr(sample);
    yield* Console.log(`${label} -> ${formatOption(option)}`);
  }
});

const examplePracticalOptionalField = Effect.gen(function* () {
  const users = [
    { id: "missing", nickname: undefined },
    { id: "null", nickname: null },
    { id: "present", nickname: "beeper" },
  ] as const;

  for (const user of users) {
    const nicknameOption = O.fromUndefinedOr(user.nickname);
    const summary = O.match(nicknameOption, {
      onNone: () => "nickname missing (None)",
      onSome: (nickname) => (nickname === null ? "nickname is explicit null" : `nickname: ${formatUnknown(nickname)}`),
    });
    yield* Console.log(`${user.id} -> ${summary}`);
  }
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
      title: "Undefined vs Null Conversion",
      description: "Show that only undefined maps to None while null remains a Some value.",
      run: exampleSourceAlignedConversions,
    },
    {
      title: "Optional Field Normalization",
      description: "Demonstrate handling optional user nicknames without erasing explicit nulls.",
      run: examplePracticalOptionalField,
    },
  ],
});

BunRuntime.runMain(program);
