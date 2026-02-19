/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: toArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * Converts an `Option` into an `Array`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.toArray(Option.some(1)))
 * // Output: [1]
 *
 * console.log(Option.toArray(Option.none()))
 * // Output: []
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
const exportName = "toArray";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts an `Option` into an `Array`.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.toArray(Option.some(1)))\n// Output: [1]\n\nconsole.log(Option.toArray(Option.none()))\n// Output: []';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSomeAndNone = Effect.gen(function* () {
  yield* Console.log("Convert Some to a singleton array and None to an empty array.");
  const fromSome = O.toArray(O.some(1));
  const fromNone = O.toArray(O.none<number>());

  yield* Console.log(`toArray(some(1)) => ${JSON.stringify(fromSome)}`);
  yield* Console.log(`toArray(none()) => ${JSON.stringify(fromNone)}`);
});

const exampleFlattenOptionalInputs = Effect.gen(function* () {
  yield* Console.log("Use toArray to keep present values and drop missing values in one pass.");
  const optionalNames = [O.some("Ada"), O.none<string>(), O.some("Linus"), O.none<string>()];
  const presentNames = optionalNames.flatMap((option) => O.toArray(option));

  yield* Console.log(`flatMap(toArray) => ${JSON.stringify(presentNames)}`);
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
      title: "Source-Aligned Some/None Conversion",
      description: "Reproduce the documented behavior for Some and None inputs.",
      run: exampleSourceAlignedSomeAndNone,
    },
    {
      title: "Flatten Optional Inputs",
      description: "Use toArray with Array.flatMap to keep only present Option values.",
      run: exampleFlattenOptionalInputs,
    },
  ],
});

BunRuntime.runMain(program);
