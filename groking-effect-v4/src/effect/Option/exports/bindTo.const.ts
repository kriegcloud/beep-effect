/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: bindTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Gives a name to the value of an `Option`, creating a single-key record inside `Some`. Starting point for the do notation pipeline.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.some(2),
 *   Option.bindTo("x"),
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
const exportName = "bindTo";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Gives a name to the value of an `Option`, creating a single-key record inside `Some`. Starting point for the do notation pipeline.";
const sourceExample =
  'import { Option, pipe } from "effect"\nimport * as assert from "node:assert"\n\nconst result = pipe(\n  Option.some(2),\n  Option.bindTo("x"),\n  Option.bind("y", () => Option.some(3)),\n  Option.let("sum", ({ x, y }) => x + y)\n)\nassert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeOption = (option: O.Option<unknown>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  })(option);

const exampleSourceAlignedBinding = Effect.gen(function* () {
  yield* Console.log('Use bindTo("x") to seed a do-notation chain from Some(2).');
  const result = O.some(2).pipe(
    O.bindTo("x"),
    O.bind("y", () => O.some(3)),
    O.let("sum", ({ x, y }) => x + y)
  );

  yield* Console.log(`result: ${summarizeOption(result)}`);
});

const exampleNoneShortCircuit = Effect.gen(function* () {
  yield* Console.log("A None input stays None and downstream bind callbacks are skipped.");
  let bindInvoked = false;

  const result = O.none<number>().pipe(
    O.bindTo("x"),
    O.bind("y", () => {
      bindInvoked = true;
      return O.some(99);
    })
  );

  yield* Console.log(`result: ${summarizeOption(result)}`);
  yield* Console.log(`bindInvoked: ${bindInvoked}`);
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
      title: "Source-Aligned Do-Notation Binding",
      description: 'Apply bindTo("x") before bind/let to build the record shown by the docs.',
      run: exampleSourceAlignedBinding,
    },
    {
      title: "None Short-Circuit",
      description: "Show that bindTo preserves None and prevents downstream bind callbacks from running.",
      run: exampleNoneShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
