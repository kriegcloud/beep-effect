/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: isNone
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Checks whether an `Option` is `None` (absent).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.isNone(Option.some(1)))
 * // Output: false
 *
 * console.log(Option.isNone(Option.none()))
 * // Output: true
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
const exportName = "isNone";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Checks whether an `Option` is `None` (absent).";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.isNone(Option.some(1)))\n// Output: false\n\nconsole.log(Option.isNone(Option.none()))\n// Output: true';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape before behavior-focused invocations.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedBehavior = Effect.gen(function* () {
  const someValue = O.some(1);
  const noneValue = O.none<number>();

  yield* Console.log(`O.isNone(${formatUnknown(someValue)}) => ${O.isNone(someValue)}`);
  yield* Console.log(`O.isNone(${formatUnknown(noneValue)}) => ${O.isNone(noneValue)}`);
});

const exampleBatchChecks = Effect.gen(function* () {
  const polled = [O.none<number>(), O.some(7), O.none<number>(), O.some(9)];
  const emptyIndices = polled.map((option, index) => (O.isNone(option) ? index : -1)).filter((index) => index >= 0);

  yield* Console.log(`poll results: ${formatUnknown(polled)}`);
  yield* Console.log(`empty poll indices: ${formatUnknown(emptyIndices)}`);
  yield* Console.log(`all empty: ${polled.every(O.isNone)}`);
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
      title: "Batch None Detection",
      description: "Use isNone across multiple Option values to find absent entries.",
      run: exampleBatchChecks,
    },
  ],
});

BunRuntime.runMain(program);
