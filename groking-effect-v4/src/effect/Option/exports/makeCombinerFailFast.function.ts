/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeCombinerFailFast
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Creates a `Combiner` for `Option<A>` with fail-fast semantics: returns `None` if either operand is `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const combiner = Option.makeCombinerFailFast(Number.ReducerSum)
 * console.log(combiner.combine(Option.some(1), Option.some(2)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 *
 * console.log(combiner.combine(Option.some(1), Option.none()))
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
const exportName = "makeCombinerFailFast";
const exportKind = "function";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Creates a `Combiner` for `Option<A>` with fail-fast semantics: returns `None` if either operand is `None`.";
const sourceExample =
  "import { Number, Option } from \"effect\"\n\nconst combiner = Option.makeCombinerFailFast(Number.ReducerSum)\nconsole.log(combiner.combine(Option.some(1), Option.some(2)))\n// Output: { _id: 'Option', _tag: 'Some', value: 3 }\n\nconsole.log(combiner.combine(Option.some(1), Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";
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
  const combiner = O.makeCombinerFailFast(Number.ReducerSum);
  const bothSome = combiner.combine(O.some(1), O.some(2));
  const rightNone = combiner.combine(O.some(1), O.none());

  yield* Console.log(`some(1) + some(2) => ${formatOption(bothSome)}`);
  yield* Console.log(`some(1) + none => ${formatOption(rightNone)}`);
});

const exampleFailFastContrast = Effect.gen(function* () {
  const combiner = O.makeCombinerFailFast(Number.ReducerSum);
  const leftNone = combiner.combine(O.none(), O.some(2));
  const bothNone = combiner.combine(O.none(), O.none());

  yield* Console.log(`none + some(2) => ${formatOption(leftNone)}`);
  yield* Console.log(`none + none => ${formatOption(bothNone)}`);
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
      description: "Combine `Some` values and contrast with a `None` operand.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Fail-Fast Contrast",
      description: "`None` on either side short-circuits to `None`.",
      run: exampleFailFastContrast,
    },
  ],
});

BunRuntime.runMain(program);
