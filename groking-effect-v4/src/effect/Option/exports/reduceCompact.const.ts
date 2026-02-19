/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: reduceCompact
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Reduces an iterable of `Option`s to a single value, skipping `None` entries.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, pipe } from "effect"
 *
 * const items = [Option.some(1), Option.none(), Option.some(2), Option.none()]
 *
 * console.log(pipe(items, Option.reduceCompact(0, (b, a) => b + a)))
 * // Output: 3
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
const exportName = "reduceCompact";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Reduces an iterable of `Option`s to a single value, skipping `None` entries.";
const sourceExample =
  'import { Option, pipe } from "effect"\n\nconst items = [Option.some(1), Option.none(), Option.some(2), Option.none()]\n\nconsole.log(pipe(items, Option.reduceCompact(0, (b, a) => b + a)))\n// Output: 3';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.reduceCompact as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedSum = Effect.gen(function* () {
  yield* Console.log("Run the documented sum behavior with Some and None values.");
  const items = [O.some(1), O.none<number>(), O.some(2), O.none<number>()];
  const total = O.reduceCompact(items, 0, (acc, value) => acc + value);

  yield* Console.log(`items -> ${formatUnknown(items)}`);
  yield* Console.log(`sum -> ${formatUnknown(total)}`);
});

const exampleCurriedSomeOnly = Effect.gen(function* () {
  yield* Console.log("Curried reduceCompact processes only Some payloads.");
  const readings = [O.some(4), O.none<number>(), O.some(10), O.none<number>(), O.some(1)];
  let reducerCalls = 0;

  const maxReading = O.reduceCompact(Number.NEGATIVE_INFINITY, (max, reading: number) => {
    reducerCalls += 1;
    return Math.max(max, reading);
  })(readings);

  const allMissing = O.reduceCompact(
    readings.map(() => O.none<number>()),
    99,
    (acc, value) => acc + value
  );

  yield* Console.log(`max reading -> ${formatUnknown(maxReading)}`);
  yield* Console.log(`reducer calls -> ${reducerCalls}`);
  yield* Console.log(`all None with seed 99 -> ${formatUnknown(allMissing)}`);
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
      title: "Source-Aligned Sum",
      description: "Replicate the documented reduction and show that None entries are skipped.",
      run: exampleSourceAlignedSum,
    },
    {
      title: "Curried Processing of Some Values",
      description: "Use data-last reduceCompact and verify the reducer runs only for Some values.",
      run: exampleCurriedSomeOnly,
    },
  ],
});

BunRuntime.runMain(program);
