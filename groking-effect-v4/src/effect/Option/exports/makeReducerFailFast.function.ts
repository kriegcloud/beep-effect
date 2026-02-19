/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeReducerFailFast
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Creates a `Reducer` for `Option<A>` by lifting an existing `Reducer` with fail-fast semantics.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const reducer = Option.makeReducerFailFast(Number.ReducerSum)
 * console.log(reducer.combineAll([Option.some(1), Option.some(2)]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 *
 * console.log(reducer.combineAll([Option.some(1), Option.none()]))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "makeReducerFailFast";
const exportKind = "function";
const moduleImportPath = "effect/Option";
const sourceSummary = "Creates a `Reducer` for `Option<A>` by lifting an existing `Reducer` with fail-fast semantics.";
const sourceExample =
  "import { Number, Option } from \"effect\"\n\nconst reducer = Option.makeReducerFailFast(Number.ReducerSum)\nconsole.log(reducer.combineAll([Option.some(1), Option.some(2)]))\n// Output: { _id: 'Option', _tag: 'Some', value: 3 }\n\nconsole.log(reducer.combineAll([Option.some(1), Option.none()]))\n// Output: { _id: 'Option', _tag: 'None' }";
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
  const reducer = O.makeReducerFailFast(Number.ReducerSum);
  const allSome = reducer.combineAll([O.some(1), O.some(2)]);
  const withNone = reducer.combineAll([O.some(1), O.none()]);

  yield* Console.log(`[some(1), some(2)] => ${formatOption(allSome)}`);
  yield* Console.log(`[some(1), none] => ${formatOption(withNone)}`);
});

const exampleFailFastPositionContrast = Effect.gen(function* () {
  const reducer = O.makeReducerFailFast(Number.ReducerSum);
  const noneFirst = reducer.combineAll([O.none(), O.some(2), O.some(3)]);
  const noneLast = reducer.combineAll([O.some(1), O.some(2), O.none()]);

  yield* Console.log(`[none, some(2), some(3)] => ${formatOption(noneFirst)}`);
  yield* Console.log(`[some(1), some(2), none] => ${formatOption(noneLast)}`);
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
      description: "Mirror the documented `combineAll` calls with `Some` and `None` inputs.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Fail-Fast Position Contrast",
      description: "`None` short-circuits regardless of where it appears in the list.",
      run: exampleFailFastPositionContrast,
    },
  ],
});

BunRuntime.runMain(program);
