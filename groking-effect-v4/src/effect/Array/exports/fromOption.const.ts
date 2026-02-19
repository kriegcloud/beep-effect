/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: fromOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Converts an `Option` to an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Option } from "effect"
 *
 * console.log(Array.fromOption(Option.some(1))) // [1]
 * console.log(Array.fromOption(Option.none())) // []
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
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromOption";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Converts an `Option` to an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.";
const sourceExample =
  'import { Array, Option } from "effect"\n\nconsole.log(Array.fromOption(Option.some(1))) // [1]\nconsole.log(Array.fromOption(Option.none())) // []';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const formatOption = <A>(option: O.Option<A>): string =>
  O.isSome(option) ? `Option.some(${formatUnknown(option.value)})` : "Option.none()";

const exampleSourceAlignedConversion = Effect.gen(function* () {
  const someInput = O.some(1);
  const noneInput = O.none<number>();

  const fromSome = A.fromOption(someInput);
  const fromNone = A.fromOption(noneInput);

  yield* Console.log(`A.fromOption(${formatOption(someInput)}) => ${JSON.stringify(fromSome)}`);
  yield* Console.log(`A.fromOption(${formatOption(noneInput)}) => ${JSON.stringify(fromNone)}`);
});

const exampleFlattenOptionStream = Effect.gen(function* () {
  const readings: Array<O.Option<number>> = [O.some(440), O.none<number>(), O.some(880), O.none<number>(), O.some(660)];
  const presentReadings = readings.flatMap(A.fromOption);

  yield* Console.log(`Readings (Option): ${readings.map(formatOption).join(", ")}`);
  yield* Console.log(`Flatten with A.fromOption => ${JSON.stringify(presentReadings)}`);
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
      title: "Source-Aligned Option Conversion",
      description: "Run the documented Some/None inputs and show their array results.",
      run: exampleSourceAlignedConversion,
    },
    {
      title: "Flattening Optional Readings",
      description: "Use fromOption with flatMap to keep only present values.",
      run: exampleFlattenOptionStream,
    },
  ],
});

BunRuntime.runMain(program);
