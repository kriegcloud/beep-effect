/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromNullOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Converts a possibly `null` value into an `Option`, leaving `undefined` as a valid `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromNullOr(null))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullOr(undefined))
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
 *
 * console.log(Option.fromNullOr(42))
 * // Output: { _id: 'Option', _tag: 'Some', value: 42 }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromNullOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a possibly `null` value into an `Option`, leaving `undefined` as a valid `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromNullOr(null))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromNullOr(undefined))\n// Output: { _id: 'Option', _tag: 'Some', value: undefined }\n\nconsole.log(Option.fromNullOr(42))\n// Output: { _id: 'Option', _tag: 'Some', value: 42 }";
const moduleRecord = O as Record<string, unknown>;

const formatOption = <A>(option: O.Option<A>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  })(option);

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.fromNullOr as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedNullBoundaries = Effect.gen(function* () {
  yield* Console.log("Reproduce the documented null, undefined, and non-null conversions.");

  const fromNull = O.fromNullOr(null);
  const fromUndefined = O.fromNullOr(undefined);
  const fromValue = O.fromNullOr(42);

  yield* Console.log(`fromNullOr(null) => ${formatOption(fromNull)}`);
  yield* Console.log(`fromNullOr(undefined) => ${formatOption(fromUndefined)}`);
  yield* Console.log(`fromNullOr(42) => ${formatOption(fromValue)}`);
});

const exampleUndefinedStaysInsideSome = Effect.gen(function* () {
  yield* Console.log("Null short-circuits to None, while undefined remains mappable inside Some.");

  const fromNull = O.fromNullOr<string | null>(null).pipe(O.map((value) => value.toUpperCase()));
  const fromUndefined = O.fromNullOr<string | undefined>(undefined).pipe(
    O.map((value) => (value === undefined ? "mapped undefined sentinel" : value.toUpperCase()))
  );

  yield* Console.log(`map(fromNullOr(null)) => ${formatOption(fromNull)}`);
  yield* Console.log(`map(fromNullOr(undefined)) => ${formatOption(fromUndefined)}`);
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
      title: "Source-Aligned Null Boundary Cases",
      description: "Mirror the JSDoc cases for null, undefined, and a concrete value.",
      run: exampleSourceAlignedNullBoundaries,
    },
    {
      title: "Undefined Preserved As Some",
      description: "Demonstrate that null becomes None while undefined still flows through map.",
      run: exampleUndefinedStaysInsideSome,
    },
  ],
});

BunRuntime.runMain(program);
