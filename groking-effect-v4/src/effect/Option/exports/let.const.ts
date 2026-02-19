/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: let
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Adds a computed plain value to the do notation record.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.Do,
 *   Option.bind("x", () => Option.some(2)),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
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
const exportName = "let";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Adds a computed plain value to the do notation record.";
const sourceExample =
  'import { Option, pipe } from "effect"\nimport * as assert from "node:assert"\n\nconst result = pipe(\n  Option.Do,\n  Option.bind("x", () => Option.some(2)),\n  Option.bind("y", () => Option.some(3)),\n  Option.let("sum", ({ x, y }) => x + y)\n)\nassert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))';
const moduleRecord = O as Record<string, unknown>;
const summarizeOption = <A>(option: O.Option<A>): string =>
  O.match(option, {
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  });

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.let as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleDoNotationDerivedField = Effect.gen(function* () {
  yield* Console.log("Add a computed field while building a record from Option.Do.");
  const result = O.Do.pipe(
    O.bind("x", () => O.some(2)),
    O.bind("y", () => O.some(3)),
    O.let("sum", ({ x, y }) => x + y)
  );

  yield* Console.log(`result: ${summarizeOption(result)}`);
});

const exampleDataFirstAndNone = Effect.gen(function* () {
  yield* Console.log("Use data-first invocation and verify None passthrough behavior.");
  const dataFirst = O.let(O.some({ x: 4, y: 1 }), "difference", ({ x, y }) => x - y);

  let computedOnNone = false;
  const noneResult = O.let(O.none<{ x: number; y: number }>(), "difference", () => {
    computedOnNone = true;
    return 0;
  });

  yield* Console.log(`data-first: ${summarizeOption(dataFirst)}`);
  yield* Console.log(`none: ${summarizeOption(noneResult)}`);
  yield* Console.log(`computed on None: ${computedOnNone}`);
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
      title: "Do Notation Derived Field",
      description: "Use Option.let in a Do pipeline to add a computed plain value.",
      run: exampleDoNotationDerivedField,
    },
    {
      title: "Data-first and None Passthrough",
      description: "Show direct invocation and that None skips the derived-value callback.",
      run: exampleDataFirstAndNone,
    },
  ],
});

BunRuntime.runMain(program);
