/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: isSome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Checks whether an `Option` contains a value (`Some`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.isSome(Option.some(1)))
 * // Output: true
 *
 * console.log(Option.isSome(Option.none()))
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
const exportName = "isSome";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Checks whether an `Option` contains a value (`Some`).";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.isSome(Option.some(1)))\n// Output: true\n\nconsole.log(Option.isSome(Option.none()))\n// Output: false';
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

  yield* Console.log(`O.isSome(${formatUnknown(someValue)}) => ${O.isSome(someValue)}`);
  yield* Console.log(`O.isSome(${formatUnknown(noneValue)}) => ${O.isSome(noneValue)}`);
});

const exampleExtractPresentValues = Effect.gen(function* () {
  const candidates = [O.some("cache-hit"), O.none<string>(), O.some("db-hit"), O.none<string>()];
  const presentValues = candidates.filter(O.isSome).map((option) => option.value);

  yield* Console.log(`candidates: ${formatUnknown(candidates)}`);
  yield* Console.log(`present values: ${formatUnknown(presentValues)}`);
  yield* Console.log(`contains any value: ${candidates.some(O.isSome)}`);
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
      description: "Run the documented Some/None checks and log their boolean results.",
      run: exampleSourceAlignedBehavior,
    },
    {
      title: "Filter Present Values",
      description: "Use isSome as a predicate to keep only present Option values.",
      run: exampleExtractPresentValues,
    },
  ],
});

BunRuntime.runMain(program);
