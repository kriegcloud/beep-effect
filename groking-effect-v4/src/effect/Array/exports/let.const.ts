/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: let
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Adds a computed plain value to the do-notation scope without introducing a new array dimension.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 2, 3]),
 *   Array.let("doubled", ({ x }) => x * 2)
 * )
 * console.log(result)
 * // [{ x: 1, doubled: 2 }, { x: 2, doubled: 4 }, { x: 3, doubled: 6 }]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "let";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Adds a computed plain value to the do-notation scope without introducing a new array dimension.";
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind("x", () => [1, 2, 3]),\n  Array.let("doubled", ({ x }) => x * 2)\n)\nconsole.log(result)\n// [{ x: 1, doubled: 2 }, { x: 2, doubled: 4 }, { x: 3, doubled: 6 }]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Array.let as the do-notation helper for derived values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleDoNotationDerivedValue = Effect.gen(function* () {
  const result = pipe(
    A.Do,
    A.bind("x", () => [1, 2, 3]),
    A.let("doubled", ({ x }) => x * 2)
  );

  yield* Console.log(`do-notation result: ${JSON.stringify(result)}`);
});

const exampleLetVsBindDimension = Effect.gen(function* () {
  const withLet = pipe(
    A.Do,
    A.bind("x", () => [1, 2]),
    A.let("label", ({ x }) => `value-${x}`)
  );
  const withBind = pipe(
    A.Do,
    A.bind("x", () => [1, 2]),
    A.bind("label", () => ["A", "B"])
  );

  yield* Console.log(`rows with let: ${withLet.length}`);
  yield* Console.log(`rows with bind: ${withBind.length}`);
});

const exampleDataFirstInvocation = Effect.gen(function* () {
  const pricedItems = [
    { subtotal: 120, discount: 15 },
    { subtotal: 80, discount: 0 },
  ];
  const withTotals = A.let(pricedItems, "total", ({ subtotal, discount }) => subtotal - discount);

  yield* Console.log(`data-first result: ${JSON.stringify(withTotals)}`);
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
      title: "Do Notation Derived Value",
      description: "Add a plain computed field after binding array-backed values in Do notation.",
      run: exampleDoNotationDerivedValue,
    },
    {
      title: "let vs bind Dimensions",
      description: "Show that let preserves row count while bind introduces an additional cartesian dimension.",
      run: exampleLetVsBindDimension,
    },
    {
      title: "Data-first Invocation",
      description: "Use Array.let directly on an existing array of scoped objects.",
      run: exampleDataFirstInvocation,
    },
  ],
});

BunRuntime.runMain(program);
