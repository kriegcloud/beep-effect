/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeReducer
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Creates a `Reducer` for `Option<A>` that prioritizes the first non-`None` value and combines values when both are `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const reducer = Option.makeReducer(Number.ReducerSum)
 * console.log(reducer.combineAll([Option.some(1), Option.none(), Option.some(2)]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Number from "effect/Number";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeReducer";
const exportKind = "function";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Creates a `Reducer` for `Option<A>` that prioritizes the first non-`None` value and combines values when both are `Some`.";
const sourceExample =
  "import { Number, Option } from \"effect\"\n\nconst reducer = Option.makeReducer(Number.ReducerSum)\nconsole.log(reducer.combineAll([Option.some(1), Option.none(), Option.some(2)]))\n// Output: { _id: 'Option', _tag: 'Some', value: 3 }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const formatOption = (option: O.Option<number>): string => (O.isSome(option) ? `Some(${option.value})` : "None");

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const reducer = O.makeReducer(Number.ReducerSum);
  const combined = reducer.combineAll([O.some(1), O.none(), O.some(2)]);
  const allSome = reducer.combineAll([O.some(1), O.some(2), O.some(3)]);

  yield* Console.log(`[some(1), none, some(2)] => ${formatOption(combined)}`);
  yield* Console.log(`[some(1), some(2), some(3)] => ${formatOption(allSome)}`);
});

const exampleNoneIdentityContrast = Effect.gen(function* () {
  const reducer = O.makeReducer(Number.ReducerSum);
  const noneAroundSome = reducer.combineAll([O.none(), O.some(4), O.none()]);
  const allNone = reducer.combineAll([O.none(), O.none(), O.none()]);

  yield* Console.log(`[none, some(4), none] => ${formatOption(noneAroundSome)}`);
  yield* Console.log(`[none, none, none] => ${formatOption(allNone)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Run the documented `combineAll` pattern with `Some` and `None` inputs.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "None Identity Contrast",
      description: "`None` acts as identity unless every value is `None`.",
      run: exampleNoneIdentityContrast,
    },
  ],
});

BunRuntime.runMain(program);
