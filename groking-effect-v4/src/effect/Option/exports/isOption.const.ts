/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: isOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Determines whether the given value is an `Option`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.isOption(Option.some(1)))
 * // Output: true
 *
 * console.log(Option.isOption(Option.none()))
 * // Output: true
 *
 * console.log(Option.isOption({}))
 * // Output: false
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
const exportName = "isOption";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Determines whether the given value is an `Option`.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.isOption(Option.some(1)))\n// Output: true\n\nconsole.log(Option.isOption(Option.none()))\n// Output: true\n\nconsole.log(Option.isOption({}))\n// Output: false';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape before behavior-focused checks.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedBehavior = Effect.gen(function* () {
  const someValue = O.some(1);
  const noneValue = O.none<number>();
  const plainObject = {};

  yield* Console.log(`O.isOption(${formatUnknown(someValue)}) => ${O.isOption(someValue)}`);
  yield* Console.log(`O.isOption(${formatUnknown(noneValue)}) => ${O.isOption(noneValue)}`);
  yield* Console.log(`O.isOption(${formatUnknown(plainObject)}) => ${O.isOption(plainObject)}`);
});

const exampleFilteringUnknownValues = Effect.gen(function* () {
  const values: ReadonlyArray<unknown> = [O.some("beep"), O.none<number>(), null, 42, "beep", { value: 1 }];
  const optionsOnly = values.filter(O.isOption);

  yield* Console.log(`values: ${formatUnknown(values)}`);
  yield* Console.log(`values.filter(O.isOption): ${formatUnknown(optionsOnly)}`);
  yield* Console.log(`detected Option count: ${optionsOnly.length}`);
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
      title: "Source JSDoc Behavior",
      description: "Run the documented Some/None/object checks and log boolean results.",
      run: exampleSourceAlignedBehavior,
    },
    {
      title: "Filtering Unknown Values",
      description: "Use isOption as a runtime guard when scanning mixed inputs.",
      run: exampleFilteringUnknownValues,
    },
  ],
});

BunRuntime.runMain(program);
