/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: fromNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Converts a nullable value to an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.fromNullishOr(1)) // [1]
 * console.log(Array.fromNullishOr(null)) // []
 * console.log(Array.fromNullishOr(undefined)) // []
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Converts a nullable value to an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.fromNullishOr(1)) // [1]\nconsole.log(Array.fromNullishOr(null)) // []\nconsole.log(Array.fromNullishOr(undefined)) // []';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedConversions = Effect.gen(function* () {
  const cases: ReadonlyArray<readonly [label: string, input: number | null | undefined]> = [
    ["1", 1],
    ["null", null],
    ["undefined", undefined],
  ];

  for (const [label, input] of cases) {
    const output = A.fromNullishOr(input);
    yield* Console.log(`fromNullishOr(${label}) -> ${formatUnknown(output)}`);
  }
});

const exampleNullishBoundary = Effect.gen(function* () {
  const fromNull = A.fromNullishOr(null);
  const fromUndefined = A.fromNullishOr(undefined);
  const fromZero = A.fromNullishOr(0);
  const fromFalse = A.fromNullishOr(false);
  const fromEmptyString = A.fromNullishOr("");

  yield* Console.log(`fromNullishOr(null) -> ${formatUnknown(fromNull)}`);
  yield* Console.log(`fromNullishOr(undefined) -> ${formatUnknown(fromUndefined)}`);
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
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Nullish Conversion",
      description: "Run the documented inputs and observe how nullish values collapse to an empty array.",
      run: exampleSourceAlignedConversions,
    },
    {
      title: "Nullish-Only Boundary",
      description: "Show that falsy but non-nullish values remain wrapped as single-element arrays.",
      run: exampleNullishBoundary,
    },
  ],
});

BunRuntime.runMain(program);
