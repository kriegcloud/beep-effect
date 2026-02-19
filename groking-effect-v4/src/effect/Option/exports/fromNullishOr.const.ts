/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Converts a nullable value (`null` or `undefined`) into an `Option`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromNullishOr(undefined))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullishOr(null))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullishOr(1))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
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
const exportName = "fromNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a nullable value (`null` or `undefined`) into an `Option`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromNullishOr(undefined))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromNullishOr(null))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromNullishOr(1))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export shape before running conversion examples.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedConversions = Effect.gen(function* () {
  const cases: ReadonlyArray<readonly [label: string, input: number | null | undefined]> = [
    ["undefined", undefined],
    ["null", null],
    ["1", 1],
  ];

  for (const [label, input] of cases) {
    const output = O.fromNullishOr(input);
    yield* Console.log(`${label} -> ${formatUnknown(output)}`);
  }
});

const exampleNullishBoundary = Effect.gen(function* () {
  const fromNull = O.fromNullishOr(null);
  const someNull = O.some(null);
  const fromZero = O.fromNullishOr(0);
  const fromFalse = O.fromNullishOr(false);
  const fromEmptyString = O.fromNullishOr("");

  yield* Console.log(`fromNullishOr(null) -> ${formatUnknown(fromNull)}`);
  yield* Console.log(`some(null) -> ${formatUnknown(someNull)}`);
  yield* Console.log(`fromNullishOr(0) -> ${formatUnknown(fromZero)}`);
  yield* Console.log(`fromNullishOr(false) -> ${formatUnknown(fromFalse)}`);
  yield* Console.log(`fromNullishOr("") -> ${formatUnknown(fromEmptyString)}`);
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
      description: "Inspect module export count, runtime type, and function preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Nullish Conversion",
      description: "Run the documented undefined/null/number inputs and inspect resulting Option values.",
      run: exampleSourceAlignedConversions,
    },
    {
      title: "Nullish-Only Boundary",
      description: "Show that only null/undefined become None; other falsy values remain Some.",
      run: exampleNullishBoundary,
    },
  ],
});

BunRuntime.runMain(program);
